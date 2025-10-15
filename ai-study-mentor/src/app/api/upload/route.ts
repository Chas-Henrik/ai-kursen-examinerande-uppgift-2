import { NextRequest, NextResponse } from "next/server";
import { pdfToText } from "pdf-ts";
import { connectDB } from '@/lib';
import { toLowercaseAlphanumeric } from "@/lib/utils";
import Document from "@/models/Document";
import Session from "@/models/Session";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Pinecone } from "@pinecone-database/pinecone";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Check for authentication token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ ok: false, message:"Unauthorized" }, { status: 401 });
    }

    // Verify JWT token and extract userId
    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };
      userId = decoded.userId;
    } catch {
      return NextResponse.json({ ok: false, message:"Invalid token" }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const link = formData.get("link") as string;

    let text: string;
    let filename: string;

    // Extract text from PDF file
    if (file) {
      
      const bytes = await file.arrayBuffer(); // Turn file into bytes with arrayBuffer()
      text = await pdfToText(new Uint8Array(bytes)); // Convert bytes to Uint8Array so pdfToText can extract text
      filename = file.name;

      // Extract text from URL link
    } else if (link) {
      try {
        
        const response = await fetch(link); // Fetch the PDF from the link
        
        const arrayBuffer = await response.arrayBuffer(); // Turn link into bytes with arrayBuffer()
        text = await pdfToText(new Uint8Array(arrayBuffer)); // Convert bytes to Uint8Array so pdfToText can extract text
        filename = link;

      } catch {
        return NextResponse.json({ ok: false, message:"Failed to fetch the URL" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ ok: false, message:"No file or link provided" }, { status: 400 });
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

    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const chunks = await textSplitter.splitText(text);

    // Initialize embeddings model
    const embeddings = new HuggingFaceTransformersEmbeddings({
      model: "sentence-transformers/all-MiniLM-L6-v2",
    });

    const vectors = await embeddings.embedDocuments(chunks);  // Generate embeddings for the chunks

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! }); // Initialize Pinecone client

    const indexName = toLowercaseAlphanumeric(userId); // Convert userId to valid Pinecone index name
    // Delete index (irreversible)
    // await pinecone.deleteIndex("ai-study-mentor");

    // Create Pinecone index if it doesn't exist
    const existingIndexes = await pinecone.listIndexes();
    console.log("Existing Pinecone indexes:", existingIndexes);
    if (!existingIndexes.indexes || 
      existingIndexes.indexes.length === 0 || 
      !existingIndexes.indexes?.some((index) => index.name === indexName)) {
      console.log(`Creating Pinecone index: ${indexName}`);

      // Create the index with server settings
      await pinecone.createIndex({
        name: indexName,
        dimension: 384, // HuggingFace embeddings dimension
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
        waitUntilReady: true,
      });
    }

    const index = pinecone.index(indexName); // Connect to the index

    // Construct entries for insert in Pinecone
    const pineconeVectors = vectors.map((vector, i) => ({
      id: `${document.id}-chunk-${i}`,
      values: vector,
      metadata: {
        documentId: document.id,
        text: chunks[i],
        model: "sentence-transformers/all-MiniLM-L6-v2",
      },
    }));

    // Pinecone namespace: only contains vectors for this specific document
    const pcNameSpace = toLowercaseAlphanumeric(filename); // Convert filename to valid Pinecone namespace

    await index.namespace(pcNameSpace).upsert(pineconeVectors);

    // Create a new session for this document
    const session = new Session({
      userId: new mongoose.Types.ObjectId(userId),
      documentId: document.id,
      documentName: filename,
      pineconeNameSpace: pcNameSpace,
      chatHistory: [],
    });
    await session.save();

    return NextResponse.json({ 
      ok: true, 
      data: {
        text,
        documentId: document.id,
        sessionId: session._id,
      }
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error("Internal server error:", error.message);
      return NextResponse.json({ ok: false, message:"Internal server error", error: error.message }, { status: 500 });
    }
  }
}
