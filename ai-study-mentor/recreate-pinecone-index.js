const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config({ path: '.env.local' });

async function recreatePineconeIndex() {
  console.log('🏗️  Återskapar Pinecone index med 768 dimensioner...');
  
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = 'ai-study-mentor';
    
    // 1. Kontrollera om index existerar
    console.log('📋 Kontrollerar befintlig index...');
    try {
      const indexes = await pc.listIndexes();
      const existingIndex = indexes.indexes?.find(index => index.name === indexName);
      
      if (existingIndex) {
        console.log(`🗑️  Tar bort befintlig index "${indexName}"...`);
        await pc.deleteIndex(indexName);
        console.log('✅ Gammal index borttagen');
        
        // Vänta lite för att säkerställa att borttagningen är klar
        console.log('⏳ Väntar 10 sekunder...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      } else {
        console.log('ℹ️  Ingen befintlig index hittad');
      }
    } catch (error) {
      console.log('ℹ️  Index existerar inte, fortsätter med skapande...');
    }

    // 2. Skapa ny index med 768 dimensioner
    console.log('🆕 Skapar ny index med 768 dimensioner...');
    await pc.createIndex({
      name: indexName,
      dimension: 768, // Matchar multilingual-e5-large modellen på Pinecone
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });

    console.log('✅ Ny Pinecone index skapad framgångsrikt!');
    console.log('📊 Konfiguration:');
    console.log('   - Namn: ai-study-mentor');
    console.log('   - Dimensioner: 768');
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
    console.error('❌ Fel vid återskapande av Pinecone index:', error.message);
    if (error.response?.data) {
      console.error('📝 API Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

recreatePineconeIndex();