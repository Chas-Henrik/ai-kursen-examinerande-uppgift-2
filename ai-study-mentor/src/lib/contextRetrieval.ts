import { similaritySearch } from "./langchain";

interface ContextResult {
  content: string;
  metadata: Record<string, unknown>;
  relevanceScore?: number;
}

class ContextRetrievalService {
  private maxContextLength: number = 2000;
  private minRelevanceScore: number = 0.7;

  async retrieveRelevantContext(
    query: string,
    userId: string,
    documentId?: string
  ): Promise<string> {
    try {
      console.log("🔍 Hämtar relevant kontext för fråga:", query);

      // Skapa namespace baserat på användare och eventuellt dokument
      const namespace = documentId ? `${userId}_${documentId}` : userId;

      // Sök efter relevanta dokument chunks
      const searchResults = await similaritySearch(query, namespace, 10);

      if (searchResults.length === 0) {
        console.log("❌ Ingen relevant kontext hittades");
        return "";
      }

      // Ranka och kombinera relevanta chunks
      const rankedContext = this.rankAndCombineContext(searchResults, query);

      console.log(`✅ Hämtade ${rankedContext.length} tecken kontext`);
      return rankedContext;
    } catch (error) {
      console.error("❌ Fel vid hämtning av kontext:", error);
      throw new Error("Kunde inte hämta relevant kontext");
    }
  }

  private rankAndCombineContext(
    results: Array<{ content: string; metadata: Record<string, unknown> }>,
    query: string
  ): string {
    // Sortera baserat på längd och relevans för frågan
    const sortedResults = results
      .filter((result) => result.content.length > 50) // Filtrera bort för korta chunks
      .sort((a, b) => {
        // Enkel relevansberäkning baserad på gemensamma ord
        const aRelevance = this.calculateSimpleRelevance(a.content, query);
        const bRelevance = this.calculateSimpleRelevance(b.content, query);
        return bRelevance - aRelevance;
      });

    // Kombinera chunks upp till maxContextLength
    let combinedContext = "";
    let currentLength = 0;

    for (const result of sortedResults) {
      const potentialAddition = result.content + "\n\n";

      if (currentLength + potentialAddition.length <= this.maxContextLength) {
        combinedContext += potentialAddition;
        currentLength += potentialAddition.length;
      } else {
        // Lägg till så mycket som möjligt av sista chunk
        const remainingSpace = this.maxContextLength - currentLength;
        if (remainingSpace > 100) {
          // Lägg bara till om det finns tillräckligt med plats
          combinedContext +=
            result.content.substring(0, remainingSpace - 3) + "...";
        }
        break;
      }
    }

    return combinedContext.trim();
  }

  private calculateSimpleRelevance(content: string, query: string): number {
    const contentWords = content.toLowerCase().split(/\s+/);
    const queryWords = query.toLowerCase().split(/\s+/);

    let matches = 0;
    queryWords.forEach((queryWord) => {
      if (queryWord.length > 2) {
        // Ignorera för korta ord
        if (
          contentWords.some(
            (contentWord) =>
              contentWord.includes(queryWord) || queryWord.includes(contentWord)
          )
        ) {
          matches++;
        }
      }
    });

    return matches / queryWords.length;
  }

  async searchInUserDocuments(
    query: string,
    userId: string,
    documentIds?: string[]
  ): Promise<ContextResult[]> {
    try {
      const results: ContextResult[] = [];

      if (documentIds && documentIds.length > 0) {
        // Sök i specifika dokument
        for (const docId of documentIds) {
          const namespace = `${userId}_${docId}`;
          const docResults = await similaritySearch(query, namespace, 5);
          results.push(
            ...docResults.map((result) => ({
              ...result,
              metadata: { ...result.metadata, documentId: docId },
            }))
          );
        }
      } else {
        // Sök i alla användarens dokument
        const namespace = userId;
        const allResults = await similaritySearch(query, namespace, 15);
        results.push(...allResults);
      }

      // Sortera efter relevans
      return results.sort((a, b) => {
        const aRelevance = this.calculateSimpleRelevance(a.content, query);
        const bRelevance = this.calculateSimpleRelevance(b.content, query);
        return bRelevance - aRelevance;
      });
    } catch (error) {
      console.error("❌ Fel vid sökning i användarens dokument:", error);
      throw new Error("Kunde inte söka i dokument");
    }
  }

  async getContextSummary(context: string): Promise<string> {
    if (context.length < 500) {
      return context;
    }

    // Enkel sammanfattning - ta första och sista delen
    const firstPart = context.substring(0, 200);
    const lastPart = context.substring(context.length - 200);

    return `${firstPart}...\n\n...${lastPart}`;
  }
}

// Singleton instance
export const contextRetrievalService = new ContextRetrievalService();

// Export funktioner för enkel användning
export const retrieveRelevantContext = (
  query: string,
  userId: string,
  documentId?: string
) => contextRetrievalService.retrieveRelevantContext(query, userId, documentId);

export const searchInUserDocuments = (
  query: string,
  userId: string,
  documentIds?: string[]
) => contextRetrievalService.searchInUserDocuments(query, userId, documentIds);

export const getContextSummary = (context: string) =>
  contextRetrievalService.getContextSummary(context);
