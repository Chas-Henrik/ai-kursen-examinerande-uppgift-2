import { generateContextualResponse } from "./langchain";
import { retrieveRelevantContext } from "./contextRetrieval";

interface ResponseConfig {
  maxLength: number;
  language: "sv" | "en";
  responseStyle: "concise" | "detailed" | "educational";
}

class AIResponseGenerator {
  private defaultConfig: ResponseConfig = {
    maxLength: 500,
    language: "sv",
    responseStyle: "educational",
  };

  async generateStudyResponse(
    question: string,
    context: string,
    language: "sv" | "en" = "sv"
  ): Promise<string> {
    try {
      console.log("🎓 Genererar studiesvar...");

      if (!context || context.trim().length === 0) {
        return this.getFallbackResponse(language);
      }

      // Skapa svenska promptmallar
      const contextArray = [context];
      const response = await generateContextualResponse(question, contextArray);

      // Validera och begränsa svar
      const validatedResponse = this.validateResponse(response, language);

      console.log("✅ Studiesvar genererat");
      return validatedResponse;
    } catch (error) {
      console.error("❌ Fel vid generering av studiesvar:", error);
      return this.getFallbackResponse(language);
    }
  }

  async generateComprehensiveResponse(
    question: string,
    userId: string,
    documentId?: string,
    config: Partial<ResponseConfig> = {}
  ): Promise<string> {
    try {
      const finalConfig = { ...this.defaultConfig, ...config };

      console.log("📚 Genererar omfattande svar...");

      // Hämta relevant kontext
      const context = await retrieveRelevantContext(
        question,
        userId,
        documentId
      );

      if (!context) {
        return this.getFallbackResponse(finalConfig.language);
      }

      // Generera svar med kontext
      const response = await this.generateStudyResponse(
        question,
        context,
        finalConfig.language
      );

      return this.formatResponse(response, finalConfig);
    } catch (error) {
      console.error("❌ Fel vid generering av omfattande svar:", error);
      return this.getFallbackResponse(config.language || "sv");
    }
  }

  private validateResponse(response: string, language: "sv" | "en"): string {
    if (!response || response.trim().length === 0) {
      return this.getFallbackResponse(language);
    }

    // Begränsa svarslängd
    const sentences = response
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const limitedSentences = sentences.slice(0, 4);
    let limitedResponse = limitedSentences.join(". ");

    // Lägg till punkt om det saknas
    if (limitedResponse && !limitedResponse.match(/[.!?]$/)) {
      limitedResponse += ".";
    }

    // Kontrollera att svaret är på rätt språk (enkel kontroll)
    if (language === "sv" && !this.containsSwedishWords(limitedResponse)) {
      console.warn("⚠️ Svar verkar inte vara på svenska");
    }

    return limitedResponse || this.getFallbackResponse(language);
  }

  private containsSwedishWords(text: string): boolean {
    const swedishWords = [
      "är",
      "och",
      "att",
      "det",
      "som",
      "för",
      "på",
      "med",
      "av",
      "till",
      "denna",
      "detta",
      "den",
      "de",
      "ett",
      "en",
      "eller",
      "kan",
      "har",
    ];

    const textLower = text.toLowerCase();
    return swedishWords.some((word) => textLower.includes(word));
  }

  private getFallbackResponse(language: "sv" | "en" = "sv"): string {
    if (language === "sv") {
      return "Den här informationen finns inte i det uppladdade materialet.";
    } else {
      return "This information is not available in the uploaded material.";
    }
  }

  private formatResponse(response: string, config: ResponseConfig): string {
    let formattedResponse = response;

    // Justera baserat på svarstil
    switch (config.responseStyle) {
      case "concise":
        // Kortare svar - ta första meningen
        const firstSentence = response.split(/[.!?]/)[0];
        formattedResponse =
          firstSentence + (firstSentence.endsWith(".") ? "" : ".");
        break;

      case "detailed":
        // Mer detaljerat svar - behåll som det är
        formattedResponse = response;
        break;

      case "educational":
        // Pedagogiskt svar - lägg till kontext
        if (config.language === "sv") {
          formattedResponse = `Baserat på dokumenten: ${response}`;
        } else {
          formattedResponse = `Based on the documents: ${response}`;
        }
        break;
    }

    // Begränsa till maxlängd
    if (formattedResponse.length > config.maxLength) {
      formattedResponse =
        formattedResponse.substring(0, config.maxLength - 3) + "...";
    }

    return formattedResponse;
  }

  async generateQuickAnswer(
    question: string,
    context: string
  ): Promise<string> {
    // Snabbt svar för chattgränssnitt
    return this.generateStudyResponse(question, context, "sv");
  }

  async generateEducationalExplanation(
    topic: string,
    context: string
  ): Promise<string> {
    const educationalPrompt = `Förklara följande ämne på ett pedagogiskt sätt: ${topic}`;

    return this.generateStudyResponse(educationalPrompt, context, "sv");
  }
}

// Singleton instance
export const aiResponseService = new AIResponseGenerator();

// Export funktioner för enkel användning
export const generateStudyResponse = (
  question: string,
  context: string,
  language?: "sv" | "en"
) => aiResponseService.generateStudyResponse(question, context, language);

export const generateComprehensiveResponse = (
  question: string,
  userId: string,
  documentId?: string,
  config?: Partial<ResponseConfig>
) =>
  aiResponseService.generateComprehensiveResponse(
    question,
    userId,
    documentId,
    config
  );

export const generateQuickAnswer = (question: string, context: string) =>
  aiResponseService.generateQuickAnswer(question, context);

export const generateEducationalExplanation = (
  topic: string,
  context: string
) => aiResponseService.generateEducationalExplanation(topic, context);
