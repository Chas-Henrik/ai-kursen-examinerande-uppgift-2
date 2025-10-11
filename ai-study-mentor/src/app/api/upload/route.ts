import { NextRequest, NextResponse } from "next/server";
import { pdfToText } from "pdf-ts";
import connectDB from "@/lib/mongodb";
import Document from "@/models/Document";
import Session from "@/models/Session";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { OpenAIEmbeddings } from '@langchain/openai';
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Pinecone } from "@pinecone-database/pinecone";

export async function POST(req: NextRequest) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const link = formData.get("link") as string;

  let text: string;
  let filename: string;

  if (file) {
    const bytes = await file.arrayBuffer(); // Uint8Array compatible
    text = await pdfToText(new Uint8Array(bytes));
    filename = file.name;
  } else if (link) {
    try {
      // Test with: https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
      const response = await fetch(link);
      const arrayBuffer = await response.arrayBuffer(); // Uint8Array compatible
      text = await pdfToText(new Uint8Array(arrayBuffer));
      filename = link;
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch the URL" },
        { status: 500 },
      );
    }
  } else {
    return NextResponse.json(
      { error: "No file or link provided" },
      { status: 400 },
    );
  }

  // Clean up broken lines and spaces
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, "\n")
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9 ,./\-+!?:;'\"()\[\]\n]+/g, "")
    .replace(/([a-zA-Zå-öÅ-Ö,])\n([a-zA-Zå-öÅ-Ö,])/g, "$1$2")
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n"); // join all lines with a newline

  // Only save document if it doesn't already exist
  const userIdObj = new mongoose.Types.ObjectId(userId);
  let document = await Document.findOne({ userId: userIdObj, filename });
  if (!document) {
    document = new Document({
      userId: userIdObj,
      filename,
      text,
    });

    await document.save();
  }

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });
  const chunks = await textSplitter.splitText(text);

  // Initialize embeddings model
  // Using HuggingFace embeddings as an alternative to OpenAI
  // Make sure to set up the model and any required API keys or configurations
  // const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });
  const vectors = await embeddings.embedDocuments(chunks);

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

  const indexName = "ai-study-mentor";
  // Delete the entire index (irreversible)
  // await pinecone.deleteIndex(indexName);

  const existingIndexes = await pinecone.listIndexes();
  console.log("Existing Pinecone indexes:", existingIndexes);
  if (!existingIndexes.indexes?.some((index) => index.name === indexName)) {
    await pinecone.createIndex({
      name: indexName,
      // dimension: 1536, // OpenAI embeddings dimension
      dimension: 384, // HuggingFace embeddings dimension
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });
  }

  const index = pinecone.index(indexName);

  const pineconeVectors = vectors.map((vector, i) => ({
    id: `${document.id}-chunk-${i}`,
    values: vector,
    metadata: {
      documentId: document.id,
      text: chunks[i],
      model: "sentence-transformers/all-MiniLM-L6-v2",
    },
  }));

  await index.upsert(pineconeVectors);

  const session = new Session({
    userId: new mongoose.Types.ObjectId(userId),
    documentId: document.id,
    documentName: filename,
    chatHistory: [],
  });
  await session.save();

  return NextResponse.json({
    text,
    documentId: document.id,
    sessionId: session._id,
  });
}
