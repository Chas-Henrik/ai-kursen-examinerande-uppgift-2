import { Ollama } from "@langchain/community/llms/ollama";

interface OllamaConfig {
  baseUrl: string;
  model: string;
  temperature: number;
}

class OllamaService {
  private ollama: Ollama;
  private config: OllamaConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: "llama3.2:1b",
      temperature: 0.3,
    };

    this.ollama = new Ollama({
      baseUrl: this.config.baseUrl,
      model: this.config.model,
      temperature: this.config.temperature,
    });
  }

  async testOllamaConnection(): Promise<boolean> {
    try {
      console.log("🔌 Testar Ollama-anslutning...");
      const response = await this.ollama.invoke(
        'Hej, svara bara "Hej tillbaka" på svenska.'
      );
      console.log("✅ Ollama svarade:", response);
      return response.toLowerCase().includes("hej");
    } catch (error) {
      console.error("❌ Ollama-anslutning misslyckades:", error);
      return false;
    }
  }

  async generateResponse(prompt: string, context: string): Promise<string> {
    try {
      const swedishPrompt = `Du är en AI studie-assistent som svarar på svenska. 
      
KONTEXT: ${context}

FRÅGA: ${prompt}

INSTRUKTIONER:
- Svara ENDAST på svenska
- Håll svaret kort (max 3-4 meningar)
- Basera svaret ENDAST på den givna kontexten
- Om informationen inte finns i kontexten, svara: "Den här informationen finns inte i det uppladdade materialet."

SVAR:`;

      console.log("🤖 Genererar svar med Ollama...");
      const response = await this.ollama.invoke(swedishPrompt);

      // Begränsa svarslängd
      const sentences = response.split(". ");
      const limitedResponse = sentences.slice(0, 4).join(". ");

      console.log("✅ Ollama svar genererat");
      return limitedResponse;
    } catch (error) {
      console.error("❌ Fel vid generering av svar:", error);
      throw new Error("Kunde inte generera svar från AI-modellen");
    }
  }

  async generateSwedishResponse(
    question: string,
    context: string
  ): Promise<string> {
    const prompt = `Kontext från dokument: ${context}

Fråga: ${question}

Svara kortfattat på svenska baserat endast på kontexten ovan. Om informationen inte finns, säg att den inte finns i materialet.`;

    try {
      const response = await this.ollama.invoke(prompt);
      return response;
    } catch (error) {
      console.error("Error generating Swedish response:", error);
      return "Kunde inte generera svar just nu. Försök igen senare.";
    }
  }
}

// Singleton instance
export const ollamaService = new OllamaService();

// Export functions för enkel användning
export const testOllamaConnection = () => ollamaService.testOllamaConnection();
export const generateResponse = (prompt: string, context: string) =>
  ollamaService.generateResponse(prompt, context);
export const generateSwedishResponse = (question: string, context: string) =>
  ollamaService.generateSwedishResponse(question, context);
