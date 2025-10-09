import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
// import { OpenAIEmbeddings } from '@langchain/openai';
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Ollama } from '@langchain/ollama';
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
    topK: 3,
    vector: queryEmbedding,
    filter: { documentId: { '$eq': documentId } },
    includeMetadata: true,
  });

  console.log("Pinecone query result:", queryResult);

  const rawContext = queryResult.matches.map(match => (match.metadata as { text: string }).text).join('\n\n');

  // Optional cleaning:
  const context = rawContext
    .replace(/Fråga:.*$/gim, '')
    .replace(/Svar:.*$/gim, '')
    .replace(/Uppgift:.*$/gim, '')
    .replace(/\d+\s+(Övning|Uppgift).*/gim, '')
    .trim();
  

  const ollama = new Ollama({
    baseUrl: 'http://localhost:11434',
    model: 'akx/viking-7b',
    temperature: 0,
  });

  console.log("query:", query);
  console.log("Context for query:\n", context);

  const prompt = `
  Du är en svensk AI-assistent.
  Använd endast information från dokumentet nedan för att svara på frågan.
  Om du inte vet svaret, skriv exakt: "Den här informationen finns inte i det uppladdade dokumentet."
  Svara kort och koncist. Avsluta svaret med texten "###".
  Ignorera alla frågor i svaret.
  Dokument: ${context}
  Fråga: ${query}
  ###
  `;

  const stream = await ollama.stream(prompt, {
    stop: ["###"],
    recursionLimit:1,
    });

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

          // Optionally truncate to first sentence on the fly
          const truncated = botMessage.split(/(?<=[.!?])\s/)[0];
          session.chatHistory[session.chatHistory.length - 1].text = truncated;
          await session.save();
        }
        controller.close();
      },
    })
  );
}
