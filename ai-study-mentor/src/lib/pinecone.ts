import { Pinecone } from "@pinecone-database/pinecone";

// Initialisera Pinecone klient
let pineconeClient: Pinecone | null = null;

export async function initializePinecone(): Promise<Pinecone> {
  if (pineconeClient) {
    return pineconeClient;
  }

  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    throw new Error("PINECONE_API_KEY saknas i miljövariabler");
  }

  pineconeClient = new Pinecone({
    apiKey: apiKey,
  });

  return pineconeClient;
}

/**
 * Laddar upp embeddings till Pinecone med metadata
 */
export async function uploadEmbeddingsToPinecone(
  embeddings: number[][],
  chunks: string[],
  metadata: {
    userId: string;
    fileName: string;
    fileType: string;
    uploadDate: Date;
    chunkCount: number;
    fileSize: number;
  },
  namespace: string
): Promise<void> {
  try {
    const pc = await initializePinecone();
    const indexName = process.env.PINECONE_INDEX_NAME || "ai-study-mentor";
    const index = pc.index(indexName);

    // Förbered vektorer för uppladdning
    const vectors = embeddings.map((embedding, i) => ({
      id: `${metadata.userId}-${Date.now()}-${i}`,
      values: embedding,
      metadata: {
        text: chunks[i],
        userId: metadata.userId,
        fileName: metadata.fileName,
        fileType: metadata.fileType,
        uploadDate: metadata.uploadDate.toISOString(),
        chunkIndex: i,
        totalChunks: metadata.chunkCount,
        fileSize: metadata.fileSize,
      },
    }));

    // Ladda upp i batches om 100 vektorer
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.namespace(namespace).upsert(batch);
    }

    console.log(`✅ Laddat upp ${vectors.length} embeddings till Pinecone`);
  } catch (error) {
    console.error("Fel vid uppladdning till Pinecone:", error);
    throw new Error(
      `Fel vid uppladdning till Pinecone: ${
        error instanceof Error ? error.message : "Okänt fel"
      }`
    );
  }
}

/**
 * Söker liknande dokument baserat på embedding-vektor
 */
export async function searchSimilarDocuments(
  queryEmbedding: number[],
  userId: string,
  topK: number = 5
): Promise<
  Array<{
    text: string;
    score: number;
    fileName?: string;
    chunkIndex?: number;
    metadata?: Record<string, unknown>;
  }>
> {
  try {
    const pc = await initializePinecone();
    const indexName = process.env.PINECONE_INDEX_NAME || "ai-study-mentor";
    const index = pc.index(indexName);

    // Sök i användarens namespace
    const searchResults = await index.namespace(userId).query({
      vector: queryEmbedding,
      topK: topK,
      includeMetadata: true,
      filter: {
        userId: userId, // Extra säkerhet - filtrera på userId
      },
    });

    // Formatera resultat
    const results = searchResults.matches.map((match) => ({
      text: String(match.metadata?.text || ""),
      score: match.score || 0,
      fileName: String(match.metadata?.fileName || "Okänd källa"),
      chunkIndex: Number(match.metadata?.chunkIndex) || 0,
      metadata: match.metadata,
    }));

    console.log(
      `🎯 Hittade ${results.length} relevanta dokument för användare ${userId}`
    );

    return results;
  } catch (error) {
    console.error("Fel vid sökning i Pinecone:", error);
    throw new Error(
      `Fel vid sökning: ${error instanceof Error ? error.message : "Okänt fel"}`
    );
  }
}

/**
 * Tar bort alla embeddings för ett specifikt dokument
 */
export async function deleteDocumentVectors(
  userId: string,
  fileName: string
): Promise<void> {
  try {
    const pc = await initializePinecone();
    const indexName = process.env.PINECONE_INDEX_NAME || "ai-study-mentor";
    const index = pc.index(indexName);

    // Ta bort alla vektorer för detta dokument
    await index.namespace(userId).deleteMany({
      userId: userId,
      fileName: fileName,
    });

    console.log(`✅ Tagit bort embeddings för ${fileName}`);
  } catch (error) {
    console.error("Fel vid borttagning från Pinecone:", error);
    throw new Error(
      `Fel vid borttagning: ${
        error instanceof Error ? error.message : "Okänt fel"
      }`
    );
  }
}
