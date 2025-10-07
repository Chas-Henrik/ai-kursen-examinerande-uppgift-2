import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
// import { OpenAIEmbeddings } from '@langchain/openai';
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Ollama } from '@langchain/community/llms/ollama';
import connectDB from '@/lib/mongodb';
import Session from '@/models/Session';
import Document from '@/models/Document';
import jwt from 'jsonwebtoken';

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

  const { query, documentId } = await req.json();

  // Initialize embeddings model
  // Using HuggingFace embeddings as an alternative to OpenAI
  // Make sure to set up the model and any required API keys or configurations
  // const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
  const embeddings = new HuggingFaceTransformersEmbeddings({ model: "sentence-transformers/all-MiniLM-L6-v2" });
  const queryEmbedding = await embeddings.embedQuery(query);

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pinecone.index('ai-study-mentor');

  const queryResult = await index.query({
    topK: 5,
    vector: queryEmbedding,
    filter: { documentId: { '$eq': documentId } },
    includeMetadata: true,
  });

  const context = queryResult.matches.map(match => (match.metadata as { text: string }).text).join('\n\n');

  const ollama = new Ollama({
    baseUrl: 'http://localhost:11434',
    model: 'akx/viking-7b',
  });

  const prompt = `
  Du är en hjälpsam AI-assistent som svarar på svenska. 
  Svara endast baserat på den uppladdade dokumenttexten. Max 4 meningar. 
  Om informationen inte finns i dokumentet, skriv exakt: "Den här informationen finns inte i det uppladdade materialet."

  Dokumenttext:
  ${context}

  Fråga:
  ${query}
  `;


  const stream = await ollama.stream(prompt);

  const document = await Document.findById(documentId);

  const session = new Session({
    userId,
    documentName: document.filename,
    chatHistory: [],
  });

  // This is not ideal, we should be streaming the response and saving it at the end.
  // But for now, we will just save the prompt and an empty response.
  session.chatHistory.push({ text: query, isUser: true });
  session.chatHistory.push({ text: '', isUser: false });
  await session.save();

  return new Response(
    new ReadableStream({
      async start(controller) {
        let botMessage = '';
        for await (const chunk of stream) {
          botMessage += chunk;
          controller.enqueue(chunk);
        }
        session.chatHistory[session.chatHistory.length - 1].text = botMessage;
        await session.save();
        controller.close();
      },
    })
  );
}
