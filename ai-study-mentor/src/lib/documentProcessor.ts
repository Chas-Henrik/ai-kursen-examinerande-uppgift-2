import fs from "fs";
import path from "path";

// Import pdf-parse traditionellt för att undvika debug-problem
import pdf from "pdf-parse";

/**
 * Extraherar text från PDF-fil
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    console.log("📖 Försöker läsa PDF från:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("❌ PDF-fil finns inte:", filePath);
      throw new Error("PDF-filen kunde inte hittas.");
    }

    console.log("📄 Läser PDF-data...");
    const dataBuffer = fs.readFileSync(filePath);

    console.log("🔍 Parsar PDF med pdf-parse...");

    // Lägg till timeout för PDF parsing (max 2 minuter)
    const PDF_TIMEOUT = 120000; // 2 minuter
    const data = await Promise.race([
      pdf(dataBuffer),
      new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(new Error("PDF parsing tog för lång tid (över 2 minuter)")),
          PDF_TIMEOUT
        )
      ),
    ]);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error(
        "Ingen text kunde extraheras från PDF-filen. Filen kan vara skadad eller innehålla endast bilder."
      );
    }

    return data.text.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Fel vid läsning av PDF: ${error.message}`);
    }
    throw new Error("Ett oväntat fel uppstod vid läsning av PDF-filen.");
  }
}

/**
 * Extraherar text från textfil
 */
export async function extractTextFromTxt(filePath: string): Promise<string> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("Textfilen kunde inte hittas.");
    }

    const text = fs.readFileSync(filePath, "utf-8");

    if (!text || text.trim().length === 0) {
      throw new Error("Textfilen är tom eller innehåller ingen läsbar text.");
    }

    return text.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Fel vid läsning av textfil: ${error.message}`);
    }
    throw new Error("Ett oväntat fel uppstod vid läsning av textfilen.");
  }
}

/**
 * Delar upp text i mindre delar (chunks) för bättre AI-bearbetning
 */
export function splitTextIntoChunks(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  if (!text || text.trim().length === 0) {
    throw new Error("Ingen text att dela upp.");
  }

  if (chunkSize <= 0) {
    throw new Error("Chunk-storleken måste vara större än 0.");
  }

  if (overlap < 0 || overlap >= chunkSize) {
    throw new Error("Överlappningen måste vara mellan 0 och chunk-storleken.");
  }

  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  if (sentences.length === 0) {
    return [text.trim()];
  }

  let currentChunk = "";

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim() + ".";

    // Om att lägga till denna mening skulle överskrida chunk-storleken
    if (
      currentChunk.length + sentence.length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());

      // Starta ny chunk med överlappning
      const wordsInChunk = currentChunk.split(" ");
      const overlapWords = wordsInChunk.slice(-Math.floor(overlap / 6)); // Ungefär 6 tecken per ord
      currentChunk = overlapWords.join(" ") + " " + sentence;
    } else {
      currentChunk += (currentChunk.length > 0 ? " " : "") + sentence;
    }
  }

  // Lägg till sista chunken om den inte är tom
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  const finalChunks = chunks.length > 0 ? chunks : [text.trim()];

  // Begränsa antalet chunks för performance (max 100 chunks)
  const MAX_CHUNKS = 100;
  if (finalChunks.length > MAX_CHUNKS) {
    console.log(
      `⚠️ Begränsar från ${finalChunks.length} till ${MAX_CHUNKS} chunks för performance`
    );
    return finalChunks.slice(0, MAX_CHUNKS);
  }

  return finalChunks;
}

/**
 * Genererar embeddings från text med hjälp av Ollama (nomic-embed-text)
 */
export async function generateEmbeddings(
  chunks: string[]
): Promise<number[][]> {
  if (!chunks || chunks.length === 0) {
    throw new Error("Inga text-chunks att generera embeddings från.");
  }

  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  try {
    const embeddings: number[][] = [];

    for (const chunk of chunks) {
      if (chunk.trim().length === 0) {
        continue;
      }

      const response = await fetch(`${ollamaBaseUrl}/api/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nomic-embed-text",
          prompt: chunk,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API fel (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (!data.embedding || !Array.isArray(data.embedding)) {
        throw new Error("Ogiltigt svar från Ollama embeddings API.");
      }

      embeddings.push(data.embedding);
    }

    if (embeddings.length === 0) {
      throw new Error("Inga embeddings kunde genereras från text-chunks.");
    }

    return embeddings;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Fel vid generering av embeddings: ${error.message}`);
    }
    throw new Error("Ett oväntat fel uppstod vid generering av embeddings.");
  }
}

/**
 * Huvudfunktion för att bearbeta dokument
 */
export async function processDocument(filePath: string): Promise<{
  chunks: string[];
  embeddings: number[][];
  metadata: {
    fileName: string;
    fileSize: number;
    fileType: string;
    chunkCount: number;
    totalCharacters: number;
  };
}> {
  try {
    const fileExt = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    const stats = fs.statSync(filePath);

    let text: string;

    // Extrahera text baserat på filtyp
    switch (fileExt) {
      case ".pdf":
        text = await extractTextFromPDF(filePath);
        break;
      case ".txt":
        text = await extractTextFromTxt(filePath);
        break;
      default:
        throw new Error(`Filtyp ${fileExt} stöds inte ännu.`);
    }

    // Dela upp texten i chunks
    const chunks = splitTextIntoChunks(text);

    // Generera embeddings
    const embeddings = await generateEmbeddings(chunks);

    const metadata = {
      fileName,
      fileSize: stats.size,
      fileType: fileExt,
      chunkCount: chunks.length,
      totalCharacters: text.length,
    };

    return {
      chunks,
      embeddings,
      metadata,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Fel vid bearbetning av dokument: ${error.message}`);
    }
    throw new Error("Ett oväntat fel uppstod vid bearbetning av dokumentet.");
  }
}

/**
 * Rensa temporära filer
 */
export async function cleanupFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Fel vid rensning av fil:", filePath, error);
    // Vi kastar inte ett fel här eftersom filrensning inte ska stoppa processen
  }
}
