import { NextRequest, NextResponse } from "next/server";
import { testOllamaConnection } from "@/lib/ollama";
import { generateStudyResponse } from "@/lib/aiResponseGenerator";
import { retrieveRelevantContext } from "@/lib/contextRetrieval";

export async function GET() {
  try {
    console.log("🧪 Startar AI-integrationstest...");

    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as Array<{
        name: string;
        status: "success" | "error";
        duration: number;
        result?: string;
        error?: string;
      }>,
    };

    // Test 1: Ollama-anslutning
    const ollamaStart = Date.now();
    try {
      const ollamaConnected = await testOllamaConnection();
      results.tests.push({
        name: "Ollama Connection",
        status: ollamaConnected ? "success" : "error",
        duration: Date.now() - ollamaStart,
        result: ollamaConnected ? "Anslutning lyckad" : "Anslutning misslyckad",
      });
    } catch (error) {
      results.tests.push({
        name: "Ollama Connection",
        status: "error",
        duration: Date.now() - ollamaStart,
        error: error instanceof Error ? error.message : "Okänt fel",
      });
    }

    // Test 2: Context retrieval med testdata
    const contextStart = Date.now();
    try {
      const testContext = await retrieveRelevantContext(
        "Vad handlar dokumentet om?",
        "test-user",
        "test-doc"
      );

      results.tests.push({
        name: "Context Retrieval",
        status: "success",
        duration: Date.now() - contextStart,
        result: `Hämtade ${testContext.length} tecken kontext`,
      });
    } catch (error) {
      results.tests.push({
        name: "Context Retrieval",
        status: "error",
        duration: Date.now() - contextStart,
        error: error instanceof Error ? error.message : "Okänt fel",
      });
    }

    // Test 3: AI Response generation
    const responseStart = Date.now();
    try {
      const testResponse = await generateStudyResponse(
        "Vad handlar dokumentet om?",
        "Detta är ett testdokument som handlar om artificiell intelligens och maskininlärning. Det beskriver grundläggande koncept inom AI.",
        "sv"
      );

      results.tests.push({
        name: "AI Response Generation",
        status: "success",
        duration: Date.now() - responseStart,
        result: testResponse.substring(0, 100) + "...",
      });
    } catch (error) {
      results.tests.push({
        name: "AI Response Generation",
        status: "error",
        duration: Date.now() - responseStart,
        error: error instanceof Error ? error.message : "Okänt fel",
      });
    }

    // Test 4: Svenska språktest
    const swedishStart = Date.now();
    try {
      const swedishResponse = await generateStudyResponse(
        "Förklara artificiell intelligens",
        "Artificiell intelligens (AI) är en gren inom datavetenskap som syftar till att skapa system som kan utföra uppgifter som normalt kräver mänsklig intelligens.",
        "sv"
      );

      const isSwedish =
        swedishResponse.includes("är") ||
        swedishResponse.includes("och") ||
        swedishResponse.includes("det");

      results.tests.push({
        name: "Swedish Language Test",
        status: isSwedish ? "success" : "error",
        duration: Date.now() - swedishStart,
        result: isSwedish ? "Svar på svenska" : "Svar inte på svenska",
      });
    } catch (error) {
      results.tests.push({
        name: "Swedish Language Test",
        status: "error",
        duration: Date.now() - swedishStart,
        error: error instanceof Error ? error.message : "Okänt fel",
      });
    }

    // Sammanfattning
    const successCount = results.tests.filter(
      (t) => t.status === "success"
    ).length;
    const totalTests = results.tests.length;
    const overallStatus = successCount === totalTests ? "success" : "partial";

    console.log(
      `✅ AI-integrationstest klart: ${successCount}/${totalTests} test lyckades`
    );

    return NextResponse.json({
      success: overallStatus === "success",
      message: `AI Integration Test - ${successCount}/${totalTests} test lyckades`,
      results,
      summary: {
        total: totalTests,
        successful: successCount,
        failed: totalTests - successCount,
        overallStatus,
      },
    });
  } catch (error) {
    console.error("❌ Fel i AI-integrationstest:", error);
    return NextResponse.json(
      {
        success: false,
        message: "AI-integrationstest misslyckades",
        error: error instanceof Error ? error.message : "Okänt fel",
      },
      { status: 500 }
    );
  }
}

// POST endpoint för att testa specifika funktioner
export async function POST(request: NextRequest) {
  try {
    const { testType, data } = await request.json();

    switch (testType) {
      case "ollama":
        const connected = await testOllamaConnection();
        return NextResponse.json({
          success: connected,
          message: connected
            ? "Ollama anslutning lyckad"
            : "Ollama anslutning misslyckad",
        });

      case "context":
        const { query, userId, documentId } = data;
        const context = await retrieveRelevantContext(
          query,
          userId,
          documentId
        );
        return NextResponse.json({
          success: true,
          message: "Kontext hämtad",
          data: {
            contextLength: context.length,
            preview: context.substring(0, 200),
          },
        });

      case "response":
        const { question, context } = data;
        const response = await generateStudyResponse(question, context, "sv");
        return NextResponse.json({
          success: true,
          message: "Svar genererat",
          data: { response },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Okänd testtyp",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("❌ Fel i AI-test POST:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Test misslyckades",
        error: error instanceof Error ? error.message : "Okänt fel",
      },
      { status: 500 }
    );
  }
}
