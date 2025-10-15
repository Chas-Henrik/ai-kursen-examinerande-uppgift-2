// Embedding utilities for document processing

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama embeddings API error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding || [];
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Kunde inte generera embedding');
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  
  for (const text of texts) {
    try {
      const embedding = await generateEmbedding(text);
      embeddings.push(embedding);
    } catch (error) {
      console.error(`Error generating embedding for text: ${text.substring(0, 50)}...`, error);
      // Push empty array as fallback
      embeddings.push([]);
    }
  }
  
  return embeddings;
}