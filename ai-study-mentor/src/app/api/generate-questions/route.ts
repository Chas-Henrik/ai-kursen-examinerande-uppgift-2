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

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });
  }

  const { documentId, sessionId } = await req.json();

  if (!mongoose.Types.ObjectId.isValid(documentId) || !mongoose.Types.ObjectId.isValid(sessionId)) {
    return NextResponse.json({ error: "Invalid documentId or sessionId" }, { status: 400 });
  }

  const session = await Session.findById(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const indexName = toLowercaseAlphanumeric(userId);
  const index = pinecone.index(indexName);

  const document = await Document.findById(documentId);
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });
  const queryEmbedding = await embeddings.embedQuery(document.text);

  console.log("Using Pinecone namespace:", session.pineconeNameSpace);

  const queryResult = await index.namespace(session.pineconeNameSpace).query({
    topK: 10,
    vector: queryEmbedding,
    filter: { documentId: { $eq: documentId } },
    includeMetadata: true,
  });

  const context = queryResult.matches
    .map((match) => (match.metadata as { text: string }).text)
    .join("\n\n");

  const ollama = new Ollama({
    baseUrl: "http://localhost:11434",
    model: "gemma3:4b"
  });

  const prompt = `
  You are a JSON generator.
  Create exactly 10 distinct study questions. Respond in swedish with an array of exactly 10 JSON objects.
  Rules:
  - The array must match the following format: [ {"question":"string", "answer":"string"} ]
  - Answer with a single string.
  - Escape double quotes (\") inside questions and answers.
  - Escape back ticks (\`) inside questions and answers.
  - If no answer, omit "answer".
  - No trailing commas.
  - Output ONLY JSON.
  Use only information from the following document: ${context}
  `;

  const rawResponse = await ollama.invoke(prompt);
  let response: QuestionItem[];
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

  if (session && session.questionId) {
    await Question.findByIdAndDelete(session.questionId);
  }

  const newQuestion = await Question.create({
    questions: response,
  });

  await Session.findByIdAndUpdate(
    sessionId,
    { questionId: newQuestion._id },
    { new: true },
  );

  return NextResponse.json({ ok: true, data: response });
}
