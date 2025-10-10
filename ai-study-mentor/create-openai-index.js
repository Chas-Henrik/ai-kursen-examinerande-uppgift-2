const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config({ path: '.env.local' });

async function createOpenAICompatibleIndex() {
  console.log('🤖 Skapar OpenAI-kompatibel Pinecone index (1536 dimensioner)...');
  
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = 'ai-study-mentor';
    
    // 1. Ta bort befintlig index
    console.log('🗑️  Tar bort befintlig index...');
    try {
      await pc.deleteIndex(indexName);
      console.log('✅ Gammal index borttagen');
      
      // Vänta för att säkerställa borttagning
      console.log('⏳ Väntar 10 sekunder...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (error) {
      console.log('ℹ️  Ingen befintlig index att ta bort');
    }

    // 2. Skapa ny index med 1536 dimensioner (OpenAI text-embedding-3-small)
    console.log('🆕 Skapar ny index med 1536 dimensioner för OpenAI embeddings...');
    await pc.createIndex({
      name: indexName,
      dimension: 1536, // Matchar OpenAI text-embedding-3-small
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });

    console.log('✅ OpenAI-kompatibel Pinecone index skapad framgångsrikt!');
    console.log('📊 Konfiguration:');
    console.log('   - Namn: ai-study-mentor');
    console.log('   - Dimensioner: 1536 (OpenAI text-embedding-3-small)');
    console.log('   - Metric: cosine');
    console.log('   - Region: us-east-1');

    // 3. Vänta på att index blir redo
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
        console.log('✅ Index är redo att använda!');
      } catch (error) {
        attempts++;
        console.log(`⏳ Försök ${attempts}/${maxAttempts}: Väntar på index...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    if (!isReady) {
      console.log('⚠️  Index kanske inte är helt redo än, men du kan försöka använda den.');
    }

  } catch (error) {
    console.error('❌ Fel vid skapande av OpenAI-kompatibel Pinecone index:', error.message);
    if (error.response?.data) {
      console.error('📝 API Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

createOpenAICompatibleIndex();