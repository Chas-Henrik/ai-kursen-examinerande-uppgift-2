import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { searchSimilarDocuments } from "@/lib/pinecone";
import { generateEmbeddings } from "@/lib/documentProcessor";

export async function POST(request: NextRequest) {
  try {
    // Verifiera JWT token (från header eller cookies)
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("auth-token")?.value;

    console.log("💬 Chat API anropad, token finns:", !!token);

    if (!token) {
      return NextResponse.json(
        { error: "Ingen autentisering angiven" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Ogiltig token" }, { status: 401 });
    }

    // Hämta frågan från request body
    const requestBody = await request.json();
    console.log("📝 Request body:", requestBody);

    const { message, conversationHistory = [] } = requestBody;
    console.log(
      "💬 Message:",
      message,
      "Type:",
      typeof message,
      "Length:",
      message?.length
    );

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      console.log("❌ Message validation failed");
      return NextResponse.json(
        { error: "Meddelande saknas eller är tomt" },
        { status: 400 }
      );
    }

    console.log(`🤔 Användare ${user.userId} frågar: "${message}"`);

    // Steg 1: Generera embedding för användarfrågan
    console.log("🧠 Genererar embedding för frågan...");
    const questionEmbeddings = await generateEmbeddings([message.trim()]);
    const questionEmbedding = questionEmbeddings[0];

    // Steg 2: Sök liknande dokument i Pinecone
    console.log("🔍 Söker relevanta dokument...");
    const relevantDocuments = await searchSimilarDocuments(
      questionEmbedding,
      user.userId,
      5 // Hämta top 5 mest relevanta chunks
    );

    if (relevantDocuments.length === 0) {
      return NextResponse.json({
        response:
          "Jag kunde inte hitta något relevant innehåll i dina uppladdade dokument för den frågan. Prova att ladda upp mer material eller omformulera din fråga.",
        sources: [],
        conversationId: `conv_${Date.now()}`,
      });
    }

    // Steg 3: Förbered kontext för AI-modellen
    const context = relevantDocuments
      .map((doc, index) => `[Källa ${index + 1}]: ${doc.text}`)
      .join("\n\n");

    // Steg 4: Generera svar med Ollama
    console.log("🤖 Genererar AI-svar...");
    const aiResponse = await generateAIResponse(
      message,
      context,
      conversationHistory
    );

    // Steg 5: Förbered källor för frontend
    const sources = relevantDocuments.map((doc, index) => ({
      id: index + 1,
      text: doc.text.substring(0, 200) + (doc.text.length > 200 ? "..." : ""),
      score: doc.score,
      fileName: doc.fileName || "Okänd källa",
      chunkIndex: doc.chunkIndex || 0,
    }));

    return NextResponse.json({
      response: aiResponse,
      sources,
      conversationId: `conv_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fel vid AI-chat:", error);

    return NextResponse.json(
      {
        error:
          "Ett fel uppstod vid bearbetning av din fråga. Försök igen senare.",
        details: error instanceof Error ? error.message : "Okänt fel",
      },
      { status: 500 }
    );
  }
}

/**
 * Genererar AI-svar med hjälp av Ollama
 */
async function generateAIResponse(
  question: string,
  context: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  // Bygg konversationskontext
  let conversationContext = "";
  if (conversationHistory.length > 0) {
    conversationContext =
      "\nTidigare konversation:\n" +
      conversationHistory
        .slice(-4) // Bara de senaste 4 meddelandena för att hålla kontexten hanterbar
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n") +
      "\n";
  }

  const prompt = `Du är en hjälpsam AI-assistent som svarar på frågor baserat på tillhandahållen information. Svara alltid på svenska och var tydlig och informativ.

${conversationContext}

Baserat på följande information från användarens dokument:

${context}

Fråga: ${question}

Svar på svenska baserat på informationen ovan. Om informationen inte räcker för att svara på frågan, säg det tydligt. Referera gärna till specifika delar av texten när det är relevant.

Svar:`;

  try {
    console.log(
      "🚀 Skickar request till Ollama:",
      `${ollamaBaseUrl}/api/generate`
    );

    const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2:1b", // Mindre modell som passar i systemets minne (1.5GB vs 6GB)
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 300, // Begränsa för mindre modell
        },
      }),
    });

    console.log("📡 Ollama response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ Ollama error response:", errorText);
      throw new Error(`Ollama API fel: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error("Inget svar från Ollama");
    }

    return data.response.trim();
  } catch (error) {
    console.error("Fel vid AI-svar generering:", error);

    // Fallback till en enkel sammanfattning av kontexten
    return `Baserat på dina dokument kan jag se information om: ${context.substring(
      0,
      300
    )}... 

Jag har för närvarande tekniska problem med AI-svars genereringen. Prova att omformulera din fråga eller kontakta support om problemet kvarstår.`;
  }
}
