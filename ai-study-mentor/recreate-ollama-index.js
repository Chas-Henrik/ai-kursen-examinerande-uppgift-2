const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config({ path: '.env.local' });

async function recreateOllamaCompatibleIndex() {
  console.log('🦙 Återskapar Pinecone index för Ollama (768 dimensioner)...');
  
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = 'ai-study-mentor';
    
    // Ta bort befintlig index
    console.log('🗑️  Tar bort befintlig OpenAI-index (1536 dim)...');
    try {
      await pc.deleteIndex(indexName);
      console.log('✅ Gammal index borttagen');
      
      console.log('⏳ Väntar 10 sekunder...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (error) {
      console.log('ℹ️  Ingen befintlig index att ta bort');
    }

    // Skapa ny index med 768 dimensioner (Ollama nomic-embed-text)
    console.log('🆕 Skapar ny index med 768 dimensioner för Ollama...');
    await pc.createIndex({
      name: indexName,
      dimension: 768, // Matchar Ollama nomic-embed-text
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });

    console.log('✅ Ollama-kompatibel Pinecone index skapad!');
    console.log('📊 Konfiguration:');
    console.log('   - Namn: ai-study-mentor');
    console.log('   - Dimensioner: 768 (Ollama nomic-embed-text)');
    console.log('   - Metric: cosine');
    console.log('   - Region: us-east-1');
    console.log('   - Kostnad: 100% GRATIS! 🎉');

    // Vänta på att index blir redo
    console.log('⏳ Väntar på att index blir redo...');
    let isReady = false;
    let attempts = 0;
    const maxAttempts = 20;

    while (!isReady && attempts < maxAttempts) {
      try {
        const index = pc.index(indexName);
        const stats = await index.describeIndexStats();
        console.log('📈 Index status:', stats);
        isReady = true;
        console.log('✅ Index är redo för Ollama embeddings!');
      } catch (error) {
        attempts++;
        console.log(`⏳ Försök ${attempts}/${maxAttempts}: Väntar på index...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

  } catch (error) {
    console.error('❌ Fel vid återskapande av Ollama-kompatibel index:', error.message);
  }
}

recreateOllamaCompatibleIndex();