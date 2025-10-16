import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Ollama } from "@langchain/community/llms/ollama";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

interface LangChainConfig {
  chunkSize: number;
  chunkOverlap: number;
  separators: string[];
}

class LangChainService {
  private textSplitter: RecursiveCharacterTextSplitter;
  private embeddings: OllamaEmbeddings;
  private llm: Ollama;
  private pinecone: Pinecone;
  private config: LangChainConfig;

  constructor() {
    this.config = {
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", ". ", " ", ""],
    };

    // Text splitter konfiguration
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.config.chunkSize,
      chunkOverlap: this.config.chunkOverlap,
      separators: this.config.separators,
    });

    // Embeddings med Ollama
    this.embeddings = new OllamaEmbeddings({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: "nomic-embed-text",
    });

    // LLM med Ollama
    this.llm = new Ollama({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: "llama3.2:1b",
      temperature: 0.3,
    });

    // Pinecone konfiguration
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }

  async splitText(text: string): Promise<string[]> {
    try {
      console.log("📄 Delar upp text i chunks...");
      const chunks = await this.textSplitter.splitText(text);
      console.log(`✅ Text delad i ${chunks.length} chunks`);
      return chunks;
    } catch (error) {
      console.error("❌ Fel vid textdelning:", error);
      throw new Error("Kunde inte dela upp texten");
    }
  }

  async createEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      console.log("🔗 Skapar embeddings...");
      const embeddings = await this.embeddings.embedDocuments(texts);
      console.log(`✅ ${embeddings.length} embeddings skapade`);
      return embeddings;
    } catch (error) {
      console.error("❌ Fel vid skapande av embeddings:", error);
      throw new Error("Kunde inte skapa embeddings");
    }
  }

  async createVectorStore(namespace: string) {
    try {
      const index = this.pinecone.index(process.env.PINECONE_INDEX_NAME!);

      const vectorStore = await PineconeStore.fromExistingIndex(
        this.embeddings,
        {
          pineconeIndex: index,
          namespace: namespace,
        }
      );

      return vectorStore;
    } catch (error) {
      console.error("❌ Fel vid skapande av vector store:", error);
      throw new Error("Kunde inte skapa vector store");
    }
  }

  async similaritySearch(
    query: string,
    namespace: string,
    k: number = 5
  ): Promise<Array<{ content: string; metadata: Record<string, unknown> }>> {
    try {
      console.log("🔍 Söker liknande dokument...");

      const vectorStore = await this.createVectorStore(namespace);
      const results = await vectorStore.similaritySearchVectorWithScore(
        await this.embeddings.embedQuery(query),
        k
      );

      const formattedResults = results.map(
        (
          result: [
            { pageContent: string; metadata: Record<string, unknown> },
            number
          ]
        ) => ({
          content: result[0].pageContent,
          metadata: result[0].metadata,
        })
      );

      console.log(`✅ Hittade ${formattedResults.length} liknande dokument`);
      return formattedResults;
    } catch (error) {
      console.error("❌ Fel vid likhetssökning:", error);
      throw new Error("Kunde inte söka liknande dokument");
    }
  }

  async generateContextualResponse(
    question: string,
    context: string[]
  ): Promise<string> {
    try {
      const combinedContext = context.join("\n\n");

      const prompt = `Du är en hjälpsam AI-assistent som svarar på svenska.

KONTEXT FRÅN DOKUMENT:
${combinedContext}

FRÅGA: ${question}

INSTRUKTIONER:
- Svara ENDAST på svenska
- Basera ditt svar ENDAST på kontexten ovan
- Håll svaret kort och koncist (max 3-4 meningar)
- Om informationen inte finns i kontexten, svara: "Den här informationen finns inte i det uppladdade materialet."

SVAR:`;

      console.log("🤖 Genererar kontextuellt svar...");
      const ollamaResponse = await fetch(`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2:1b',
          prompt: prompt,
          stream: false
        })
      });
      
      if (!ollamaResponse.ok) {
        throw new Error(`HTTP ${ollamaResponse.status}`);
      }
      
      const data = await ollamaResponse.json();
      const response = data.response || "";
      console.log("✅ Kontextuellt svar genererat");

      return response;
    } catch (error) {
      console.error("❌ Fel vid generering av kontextuellt svar:", error);
      throw new Error("Kunde inte generera kontextuellt svar");
    }
  }

  // Hämta LLM för direkt användning
  getLLM(): Ollama {
    return this.llm;
  }

  // Hämta embeddings för direkt användning
  getEmbeddings(): OllamaEmbeddings {
    return this.embeddings;
  }
}

// Singleton instance
export const langChainService = new LangChainService();

// Export funktioner för enkel användning
export const splitText = (text: string) => langChainService.splitText(text);
export const createEmbeddings = (texts: string[]) =>
  langChainService.createEmbeddings(texts);
export const similaritySearch = (
  query: string,
  namespace: string,
  k?: number
) => langChainService.similaritySearch(query, namespace, k);
export const generateContextualResponse = (
  question: string,
  context: string[]
) => langChainService.generateContextualResponse(question, context);
