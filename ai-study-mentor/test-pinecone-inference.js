const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config({ path: '.env.local' });

async function testPineconeInferenceAPI() {
  console.log('🧪 Testar Pinecone Inference API...');
  
  try {
    const apiKey = process.env.PINECONE_API_KEY;
    
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY saknas i .env.local');
    }

    // Test 1: Generera embeddings
    console.log('📝 Test 1: Genererar embeddings...');
    const testText = 'Detta är en test av svenska text för embedding-generering.';
    
    // Försök olika endpoints för Pinecone Inference API
    const endpoints = [
      'https://api.pinecone.io/v1/embed',
      'https://inference.pinecone.io/v1/embed', 
      'https://prod-1-data.ke.pinecone.io/v1/embed'
    ];

    let response;
    let lastError;
    
    for (const endpoint of endpoints) {
      console.log(`🔍 Försöker endpoint: ${endpoint}`);
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Api-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'multilingual-e5-large',
            inputs: [testText],
          }),
        });

        if (response.ok) {
          console.log(`✅ Fungerande endpoint: ${endpoint}`);
          break;
        } else {
          const errorText = await response.text();
          console.log(`❌ ${endpoint} - Status: ${response.status}, Error: ${errorText}`);
          lastError = errorText;
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Fel: ${error.message}`);
        lastError = error.message;
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}): ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log('✅ Embeddings genererade!');
    console.log(`📊 Dimensioner: ${data.data[0].values.length}`);
    console.log(`🔢 Första 5 värden: [${data.data[0].values.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);

    // Test 2: Testa Pinecone index
    console.log('\n📝 Test 2: Testar Pinecone index...');
    const pc = new Pinecone({ apiKey });
    const index = pc.index('ai-study-mentor');
    
    const stats = await index.describeIndexStats();
    console.log('✅ Pinecone index anslutning fungerar!');
    console.log('📈 Index statistik:', JSON.stringify(stats, null, 2));

    // Test 3: Testa att lagra embedding
    console.log('\n📝 Test 3: Testar att lagra embedding...');
    const testId = `test-${Date.now()}`;
    
    await index.upsert([{
      id: testId,
      values: data.data[0].values,
      metadata: {
        text: testText,
        source: 'test',
        type: 'test-embedding'
      }
    }]);

    console.log('✅ Embedding lagrad i Pinecone!');

    // Test 4: Testa sökning
    console.log('\n📝 Test 4: Testar sökning...');
    const searchResults = await index.query({
      vector: data.data[0].values,
      topK: 1,
      includeMetadata: true
    });

    console.log('✅ Sökning fungerar!');
    console.log('🔍 Sökresultat:', JSON.stringify(searchResults, null, 2));

    // Rensa upp testdata
    console.log('\n🧹 Rensar upp testdata...');
    await index.deleteOne(testId);
    console.log('✅ Testdata borttagen');

    console.log('\n🎉 Alla tester passerade! Pinecone Inference API fungerar korrekt.');

  } catch (error) {
    console.error('❌ Fel vid test:', error.message);
    if (error.response?.data) {
      console.error('📝 API Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testPineconeInferenceAPI();