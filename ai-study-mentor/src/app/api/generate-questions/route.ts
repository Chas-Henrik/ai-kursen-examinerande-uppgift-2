import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Ollama } from "@langchain/ollama";
import connectDB from "@/lib/mongodb";
import Document from "@/models/Document";
import Question from "@/models/Question";
import Session from "@/models/Session";

export async function POST(req: NextRequest) {
  await connectDB();

  const { documentId, sessionId } = await req.json();

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pinecone.index("ai-study-mentor");

  const document = await Document.findById(documentId);
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });
  const queryEmbedding = await embeddings.embedQuery(document.text);

  const queryResult = await index.query({
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
    model: "gemma3:1b",
  });

  const prompt = `
  Du är en svensk AI-assistent som svarar på svenska.
  Skapa en lista med 10 instuderingsfrågor i plain text. Avsluta med texten "###".
  Använd endast information från dokumentet nedan.
  Dokument: ${context}
  ###
  `;

  const response = await ollama.invoke(prompt, {
    stop: ["###"],
  });

  const lines = response.split("\n").filter((q) => q.trim() !== "");
  const header = lines.length > 0 ? lines[0] : "Instuderingsfrågor";
  const questions = [];
  let currentQuestion = "";

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\d+\./.test(line)) {
      if (currentQuestion) {
        questions.push(currentQuestion.trim());
      }
      currentQuestion = line;
    } else {
      currentQuestion += "\n" + line;
    }
  }
  if (currentQuestion) {
    questions.push(currentQuestion.trim());
  }

  const session = await Session.findById(sessionId);
  if (session && session.questionId) {
    await Question.findByIdAndDelete(session.questionId);
  }

  const newQuestion = await Question.create({
    header: header,
    questions: questions,
  });

  console.log("New question created:", newQuestion._id);

  const updatedSession = await Session.findByIdAndUpdate(
    sessionId,
    { questionId: newQuestion._id },
    { new: true },
  );

  console.log("Updated session:", updatedSession);

  return NextResponse.json({ questions });
}
