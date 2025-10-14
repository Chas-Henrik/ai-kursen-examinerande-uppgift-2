import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
// import { OpenAIEmbeddings } from '@langchain/openai';
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Ollama } from "@langchain/ollama";
import { connectDB } from '@/lib';
import Session from "@/models/Session";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { toLowercaseAlphanumeric } from "@/lib/utils";

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


  const { query, documentId, sessionId } = await req.json(); // Parse request body

  // Check if sessionId are valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return NextResponse.json({ ok: false, message: "Invalid sessionId" }, { status: 400 });
  }

  // Check for valid session
  const session = await Session.findById(sessionId);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Session not found" }, { status: 404 });
  }

  // Initialize embeddings model
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });

  const queryEmbedding = await embeddings.embedQuery(query); // Generate embedding for the query

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! }); // Initialize Pinecone client

  const indexName = toLowercaseAlphanumeric(userId); // Check if userId is valid Alphanumeric for Pinecone index name

  const index = pinecone.index(indexName); // Get Pinecone index

  console.log("Using Pinecone namespace:", session.pineconeNameSpace);

  // Find relevant documents in Pinecone by comparing query embedding
  // Searching in the users index and the current session namespace
  // We use topK=3 to get the three most relevant documents
  const queryResult = await index.namespace(session.pineconeNameSpace).query({
    topK: 3,
    vector: queryEmbedding,
    filter: { documentId: { $eq: documentId } },
    includeMetadata: true,
  });

  console.log("Pinecone query result:", queryResult);

  const context = queryResult.matches
    .map((match) => (match.metadata as { text: string }).text)
    .join("\n\n");

  // Optional cleaning:
  // const context = rawContext
  //   .replace(/Fråga:.*$/gim, '')
  //   .replace(/Svar:.*$/gim, '')
  //   .replace(/Uppgift:.*$/gim, '')
  //   .replace(/\d+\s+(Övning|Uppgift).*/gim, '')
  //   .trim();

  // Initialize Ollama client with our model
  // Temperature 0 to get more precise answers
  const ollama = new Ollama({
    baseUrl: "http://localhost:11434",
    model: "gemma3:4b",
    temperature: 0,
  });

  // Prompt with system instructions, context from uploaded material and the user query
  const prompt = `
  <sytemInstructions>
    You are a helpful AI-assistant. 
    You will be provided with material and a query. 
    You can only answer queries related to the material, if it is not related, answer with "Jag kan inte hitta något om detta i materialet. Finns det något annat jag kan hjälpa dig med?".
    Keep your answers short and concise.
    Important:
    - Treat uppercase and lowercase letters as the same (case-insensitive matching).
  </sytemInstructions>
  <material>
    ${context}
  </material>
  <query>
    ${query}
  </query>
  ###
  `;

  // Initiate chunk streaming response from Ollama with prompt
  // Stop sequence to end the response
  // Recursion limit to avoid long chains of thought and infinite loops
  const stream = await ollama.stream(prompt, {
    stop: ["###"],
    recursionLimit: 1,
  });

  // Save the user query and an initially empty bot response to the chat history
  session.chatHistory.push({ text: query, isUser: true });
  session.chatHistory.push({ text: "", isUser: false });
  await session.save();

  // Return response as ReadableStream to the client
  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(chunk);
          // Append the latest chunk to the latest bot response in chat history
          session.chatHistory[session.chatHistory.length - 1].text += chunk;
        }
        // Final save of the complete bot message
        await session.save();
        controller.close();
      },
    }),
  );
}
