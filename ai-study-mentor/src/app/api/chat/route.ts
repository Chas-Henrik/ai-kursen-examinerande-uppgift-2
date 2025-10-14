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

  const { query, documentId, sessionId } = await req.json();

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return NextResponse.json({ ok: false, message: "Invalid sessionId" }, { status: 400 });
  }

  const session = await Session.findById(sessionId);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Session not found" }, { status: 404 });
  }

  // Initialize embeddings model
  // Using HuggingFace embeddings as an alternative to OpenAI
  // Make sure to set up the model and any required API keys or configurations
  // const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });
  const queryEmbedding = await embeddings.embedQuery(query);

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const indexName = toLowercaseAlphanumeric(userId);
  const index = pinecone.index(indexName);

  console.log("Using Pinecone namespace:", session.pineconeNameSpace);

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

  const ollama = new Ollama({
    baseUrl: "http://localhost:11434",
    model: "gemma3:4b",
    temperature: 0,
  });

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

  const stream = await ollama.stream(prompt, {
    stop: ["###"],
    recursionLimit: 1,
  });

  // This is not ideal, we should be streaming the response and saving it at the end.
  // But for now, we will just save the prompt and an empty response.
  session.chatHistory.push({ text: query, isUser: true });
  session.chatHistory.push({ text: "", isUser: false });
  await session.save();

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(chunk);
          session.chatHistory[session.chatHistory.length - 1].text += chunk;
        }
        await session.save();
        controller.close();
      },
    }),
  );
}
