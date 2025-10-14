import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Ollama } from "@langchain/ollama";
import { connectDB } from '@/lib';
import Document from "@/models/Document";
import Question from "@/models/Question";
import { QuestionItem } from "@/models/Question";
import Session from "@/models/Session";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { toLowercaseAlphanumeric } from "@/lib/utils";

/**
 * Parses raw Markdown output from Gemma into JSON.
 * Handles ```json fences automatically.
 */
function parseGemmaJSON<T>(raw: string): T {
  // Trim and try to extract a ```json code block
  const match = raw.match(/```json\s*([\s\S]*?)```/i);
  const jsonText = match ? match[1].trim() : raw.trim();
  // Remove trailing commas from the JSON string
  const cleanedJsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');


  // Attempt to parse the extracted text as JSON
  try {
    return JSON.parse(cleanedJsonText) as T;
  } catch (err) {
    throw new Error(`Failed to parse JSON from Gemma output.\nRaw input: ${raw}\nError: ${(err as Error).message}`);
  }
}

export async function POST(req: NextRequest) {
  await connectDB();

  // Check for authentication token
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  // Verify JWT token and extract userId
  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });
  }
  
  const { documentId, sessionId } = await req.json(); // Parse request body

  // Check if documentId and sessionId are valid ObjectIds
  if (!mongoose.Types.ObjectId.isValid(documentId) || !mongoose.Types.ObjectId.isValid(sessionId)) {
    return NextResponse.json({ ok: false,  message: "Invalid documentId or sessionId" }, { status: 400 });
  }

  const session = await Session.findById(sessionId);
  if (!session) {
    return NextResponse.json({ ok: false,  message: "Session not found" }, { status: 404 });
  }
  
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! }); // Initialize Pinecone client

  const indexName = toLowercaseAlphanumeric(userId); // Check if userId is valid Alphanumeric for Pinecone index name

  const index = pinecone.index(indexName); // Get Pinecone index

  // Fetch the document to generate questions from
  const document = await Document.findById(documentId);
  if (!document) {
    return NextResponse.json({ ok: false,  message: "Document not found" }, { status: 404 });
  }

  // Initialize embeddings model
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });

  const queryEmbedding = await embeddings.embedQuery(document.text); // Generate embedding for the document text

  console.log("Using Pinecone namespace:", session.pineconeNameSpace);

  // Find relevant documents in Pinecone with query embedding
  // Searching in the users index and the current session namespace
  // We use topK=10 to get the three most relevant documents
  const queryResult = await index.namespace(session.pineconeNameSpace).query({
    topK: 10,
    vector: queryEmbedding,
    filter: { documentId: { $eq: documentId } },
    includeMetadata: true,
  });

  // Combine the text of the top matches into a single context string
  const context = queryResult.matches
    .map((match) => (match.metadata as { text: string }).text)
    .join("\n\n");

  // Initialize Ollama client
  const ollama = new Ollama({
    baseUrl: "http://localhost:11434",
    model: "gemma3:4b"
  });

  // Prompt with system instructions and context
  const prompt = `
  You are a JSON generator.
  Create exactly 10 distinct study questions as JSON.
  Rules:
  - Output must be a single JSON array with exactly 10 objects:
    [ {"question":"string", "answer":"string"} ]
  - Escape all double quotes (\") and backticks (\`) inside questions and answers.
  - Do NOT include trailing commas anywhere.
  - Always output valid JSON only — do not include any text outside the JSON array.
  - Each object must have exactly two keys: "question" and "answer".
  - If the answer is not explicitly in the document, generate a reasonable one.
  - Use only information from the following document: ${context}
  `;

  // Invoke Ollama model with the prompt
  const rawResponse = await ollama.invoke(prompt);
  let response: QuestionItem[];

  // Parse the JSON response from Gemma
  try {
    response = parseGemmaJSON<QuestionItem[]>(rawResponse);
    console.log("Raw Gemma response length:", response.length);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error parsing Gemma JSON response:", error.message);
      return NextResponse.json({ ok: false, message: "Error parsing Gemma JSON response.", error: error.message }, { status: 500 });
    }
    console.error("Error parsing Gemma JSON response:", error);
    return NextResponse.json({ ok: false, message:"Failed to parse Gemma JSON response." }, { status: 500 });
  }

  // Limit to 10 questions, just in case
  if(response?.length > 10) {
    response.splice(10);
  }

  // Delete previous questions for this session, if any
  if (session && session.questionId) {
    await Question.findByIdAndDelete(session.questionId);
  }

  // Save new questions to the database
  const newQuestion = await Question.create({
    questions: response,
  });

  // Link the new questions to the session
  await Session.findByIdAndUpdate(
    sessionId,
    { questionId: newQuestion._id },
    { new: true },
  );

  return NextResponse.json({ ok: true, data: response });
}
