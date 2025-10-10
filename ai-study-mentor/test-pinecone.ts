/**
 * Test script för att verifiera Pinecone-anslutning
 * Kör: node --loader ts-node/esm test-pinecone.ts
 */

import {
  initializePinecone,
  getPineconeIndex,
  getIndexStats,
} from "./src/lib/pinecone.js";
import dotenv from "dotenv";

// Ladda environment variables
dotenv.config({ path: ".env.local" });

async function testPineconeConnection() {
  console.log("🌲 Testar Pinecone-anslutning...\n");

  try {
    // Test 1: Initiera Pinecone
    console.log("1. Initierar Pinecone-klient...");
    const pinecone = initializePinecone();
    console.log("✅ Pinecone-klient skapad\n");

    // Test 2: Anslut till index
    console.log("2. Ansluter till index...");
    const index = await getPineconeIndex();
    console.log("✅ Index-anslutning lyckad\n");

    // Test 3: Hämta index-statistik
    console.log("3. Hämtar index-statistik...");
    const stats = await getIndexStats();
    console.log("✅ Index-statistik hämtad:");
    console.log(`   📊 Dimension: ${stats.dimension}`);
    console.log(`   📈 Totala poster: ${stats.totalRecordCount || 0}`);
    console.log(
      `   💾 Index fullhet: ${(stats.indexFullness * 100).toFixed(2)}%`
    );
    console.log(
      `   🏷️  Namespaces: ${Object.keys(stats.namespaces || {}).length}`
    );

    console.log("\n🎉 Alla tester klarade! Pinecone är redo att användas.");
  } catch (error) {
    console.error("❌ Fel vid Pinecone-test:", error);

    if (error instanceof Error) {
      if (error.message.includes("API_KEY")) {
        console.log("\n🔑 Kontrollera din PINECONE_API_KEY i .env.local");
      } else if (error.message.includes("INDEX_NAME")) {
        console.log(
          '\n📝 Kontrollera att indexet "ai-study-mentor" existerar i Pinecone Console'
        );
      } else {
        console.log(
          "\n💡 Kontrollera att alla environment variables är korrekt satta"
        );
      }
    }
  }
}

// Kör test
testPineconeConnection();
