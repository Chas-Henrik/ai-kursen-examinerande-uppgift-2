import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Document from '@/models/Document';
import { pdfToText } from 'pdf-ts';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import pinecone from '@/lib/db/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { embeddings } from '@/lib/embeddings';
import { PineconeStore } from '@langchain/pinecone';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const url = formData.get('url') as string | null;

    let extractedText = '';
    let title = 'Uppladdat material';
    let docType: 'pdf' | 'url' | 'text' = 'text';

    if (file) {
      title = file.name;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (file.type === 'application/pdf') {
        extractedText = await pdfToText(buffer);
        docType = 'pdf';
      } else if (file.type === 'text/plain') {
        extractedText = buffer.toString('utf-8');
        docType = 'text';
      } else {
        return NextResponse.json({ message: 'Unsupported file type.' }, { status: 400 });
      }
    } else if (url) {
      try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        extractedText = $('body').text();
        title = $('title').text() || url;
        docType = 'url';
      } catch (urlError: any) {
        return NextResponse.json({ message: `Failed to fetch or parse URL: ${urlError.message}` }, { status: 400 });
      }
    } else {
      return NextResponse.json({ message: 'No file or URL provided.' }, { status: 400 });
    }

    extractedText = extractedText.replace(/\s\s+/g, ' ').trim();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined.');
    }

    let userId;
    try {
      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
    }

    const newDocument = new Document({
      userId,
      title,
      content: extractedText,
      type: docType,
    });

    await newDocument.save();
    console.log('Document saved with ID:', newDocument._id);
    // Embed and store in Pinecone
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    console.log('Text splitter created', textSplitter);
    const docs = await textSplitter.createDocuments([extractedText]);
    console.log('Documents split into chunks:', docs.length);
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      namespace: newDocument._id.toString(),
    });
    console.log('Document chunks embedded and stored in Pinecone.');

    return NextResponse.json({ message: 'Material uploaded and processed successfully.', documentId: newDocument._id }, { status: 200 });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'An error occurred during upload.', error: error.message }, { status: 500 });
  }
}
