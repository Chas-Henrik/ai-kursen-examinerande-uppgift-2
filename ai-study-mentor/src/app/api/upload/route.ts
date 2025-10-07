import { NextRequest, NextResponse } from 'next/server';
import { pdfToText } from 'pdf-ts';
import * as cheerio from 'cheerio';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import jwt from 'jsonwebtoken';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
// import { OpenAIEmbeddings } from '@langchain/openai';
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Pinecone } from '@pinecone-database/pinecone';

export async function POST(req: NextRequest) {
  await connectDB();

  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    userId = decoded.userId;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const link = formData.get('link') as string;

  let text: string;
  let filename: string;

  if (file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    text = await pdfToText(buffer);
    filename = file.name;
  } else if (link) {
    try {
      const response = await fetch(link);
      const html = await response.text();
      const $ = cheerio.load(html);
      text = $('body').text();
      filename = link;
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch the URL' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'No file or link provided' }, { status: 400 });
  }

  const document = new Document({
    userId,
    filename,
    text,
  });

  await document.save();

  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
  const chunks = await textSplitter.splitText(text);

  // Initialize embeddings model
  // Using HuggingFace embeddings as an alternative to OpenAI
  // Make sure to set up the model and any required API keys or configurations
  // const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
  const embeddings = new HuggingFaceTransformersEmbeddings({ model: "sentence-transformers/all-MiniLM-L6-v2" });
  const vectors = await embeddings.embedDocuments(chunks);

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

  const indexName = 'ai-study-mentor';
  const existingIndexes = await pinecone.listIndexes();
  if (!existingIndexes.indexes?.some(index => index.name === indexName)) {
    await pinecone.createIndex({
      name: indexName,
      // dimension: 1536, // OpenAI embeddings dimension
      dimension: 384, // HuggingFace embeddings dimension
      metric: 'cosine',
      spec: { 
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      } 
    });
  }

  const index = pinecone.index(indexName);

  const pineconeVectors = vectors.map((vector, i) => ({
    id: `${document.id}-chunk-${i}`,
    values: vector,
    metadata: {
      documentId: document.id,
      text: chunks[i],
    },
  }));

  await index.upsert(pineconeVectors);

  return NextResponse.json({ text, documentId: document.id });
}
