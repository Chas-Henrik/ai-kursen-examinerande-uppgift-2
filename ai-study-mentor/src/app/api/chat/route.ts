import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { searchSimilarDocuments } from "@/lib/pinecone";
import { generateEmbeddings } from "@/lib/documentProcessor";
import { connectDB } from "@/lib/db";
import { ChatSession } from "@/models/ChatSession";

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

    const { message, conversationHistory = [], sessionId } = requestBody;
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

    // Steg 3: Förbered kontext för AI-modellen (begränsa längd)
    const context = relevantDocuments
      .map(
        (doc, index) => `[Källa ${index + 1}]: ${doc.text.substring(0, 800)}...`
      ) // Begränsa varje chunk till 800 tecken
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

    // Steg 6: Spara konversation till databas
    await connectDB();

    let currentSession;
    let actualSessionId = sessionId;

    if (sessionId) {
      // Uppdatera befintlig session
      currentSession = await ChatSession.findById(sessionId);
      if (currentSession && currentSession.userId.toString() === user.userId) {
        currentSession.messages.push(
          {
            role: "user",
            content: message,
            timestamp: new Date(),
          },
          {
            role: "assistant",
            content: aiResponse,
            timestamp: new Date(),
          }
        );
        currentSession.updatedAt = new Date();
        await currentSession.save();
        actualSessionId = (currentSession._id as any).toString();
      }
    } else {
      // Skapa ny session (låt MongoDB generera _id automatiskt)
      const sessionTitle =
        message.substring(0, 50) + (message.length > 50 ? "..." : "");
      currentSession = new ChatSession({
        userId: user.userId,
        title: sessionTitle,
        messages: [
          {
            role: "user",
            content: message,
            timestamp: new Date(),
          },
          {
            role: "assistant",
            content: aiResponse,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await currentSession.save();
      actualSessionId = (currentSession._id as any).toString();
    }

    return NextResponse.json({
      response: aiResponse,
      sources,
      conversationId: actualSessionId,
      sessionId: actualSessionId,
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

  const prompt = `Du är en hjälpsam AI-assistent som ger korta, tydliga svar på svenska baserat på tillhandahållen information.

${conversationContext}

Baserat på följande information från användarens dokument:

${context}

Fråga: ${question}

Ge ett kort och precist svar på svenska (max 2-3 meningar) baserat på informationen ovan. Om informationen inte räcker, säg det tydligt.

Svar:`;

  try {
    console.log(
      "🚀 Skickar request till Ollama:",
      `${ollamaBaseUrl}/api/generate`
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minuter timeout

    const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "llama3.2:1b", // Mindre modell som passar i systemets minne (1.5GB vs 6GB)
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 200, // Minska för snabbare svar
        },
      }),
    });

    clearTimeout(timeoutId);

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
