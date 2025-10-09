import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
// import { OpenAIEmbeddings } from '@langchain/openai';
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Ollama } from '@langchain/ollama';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import Question from '@/models/Question';

export async function POST(req: NextRequest) {
  await connectDB();

  const { documentId } = await req.json();

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pinecone.index('ai-study-mentor');

  const document = await Document.findById(documentId);
  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  // Initialize embeddings model
  // Using HuggingFace embeddings as an alternative to OpenAI
  // Make sure to set up the model and any required API keys or configurations
  // const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
  const embeddings = new HuggingFaceTransformersEmbeddings({ model: "sentence-transformers/all-MiniLM-L6-v2" });
  const queryEmbedding = await embeddings.embedQuery(document.text);

  const queryResult = await index.query({
    topK: 10,
    vector: queryEmbedding,
    filter: { documentId: { '$eq': documentId } },
    includeMetadata: true,
  });

  const context = queryResult.matches.map(match => (match.metadata as { text: string }).text).join('\n\n');

  const ollama = new Ollama({
    baseUrl: 'http://localhost:11434',
    model: 'gemma3:1b',
  });


  const prompt = `
  Du är en svensk AI-assistent som skapar instuderingsfrågor på svenska.
  Skapa en lista med 10 instuderingsfrågor. Avsluta med texten "###".
  Använd endast information från dokumentet nedan.
  Dokument: ${context}
  ###
  `;

  const response = await ollama.invoke(prompt, {
    stop: ["###"],
    recursionLimit:1,
  });

  const questions = response.split('\n').filter(q => q.trim() !== '');

  const questionDocs = questions.map(question => ({
    documentId,
    question,
  }));

  await Question.insertMany(questionDocs);

  return NextResponse.json({ questions });
}
