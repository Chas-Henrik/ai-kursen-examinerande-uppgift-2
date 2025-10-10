const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config({ path: '.env.local' });

async function testOpenAIEmbeddings() {
  console.log('🤖 Testar OpenAI Embeddings integration...');
  
  try {
    // Kontrollera miljövariabler
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    
    if (!openaiApiKey || openaiApiKey === 'din_openai_api_nyckel_här') {
      console.log('⚠️  OPENAI_API_KEY saknas eller är inte uppdaterad i .env.local');
      console.log('📝 Gå till https://platform.openai.com/api-keys för att få din API-nyckel');
      return;
    }

    if (!pineconeApiKey) {
      console.log('❌ PINECONE_API_KEY saknas i .env.local');
      return;
    }

    console.log('✅ API-nycklar hittade');

    // Test 1: OpenAI Embeddings
    console.log('\n📝 Test 1: Genererar embeddings med OpenAI...');
    const openai = new OpenAI({ apiKey: openaiApiKey });
    
    const testTexts = [
      'Detta är en test av svenska text för embedding-generering.',
      'Artificiell intelligens och maskininlärning är fascinerande områden.',
      'Studenten ska kunna förstå grundläggande AI-koncept.'
    ];

    const embeddings = [];
    
    for (const text of testTexts) {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      });
      
      embeddings.push({
        text: text,
        embedding: response.data[0].embedding,
        dimensions: response.data[0].embedding.length
      });
    }

    console.log('✅ OpenAI embeddings genererade!');
    console.log(`📊 Antal embeddings: ${embeddings.length}`);
    console.log(`🔢 Dimensioner: ${embeddings[0].dimensions}`);
    console.log(`💰 Total tokens: ${embeddings.reduce((sum, _, i) => sum + testTexts[i].split(' ').length, 0)}`);

    // Test 2: Pinecone anslutning
    console.log('\n📝 Test 2: Testar Pinecone anslutning...');
    const pc = new Pinecone({ apiKey: pineconeApiKey });
    const index = pc.index('ai-study-mentor');
    
    const stats = await index.describeIndexStats();
    console.log('✅ Pinecone anslutning fungerar!');
    console.log(`📈 Index dimensioner: ${stats.dimension}`);
    console.log(`📊 Index status:`, JSON.stringify(stats, null, 2));

    // Kontrollera dimension-kompatibilitet
    if (stats.dimension !== embeddings[0].dimensions) {
      console.log(`⚠️  VARNING: Dimension mismatch!`);
      console.log(`   OpenAI: ${embeddings[0].dimensions} dimensioner`);
      console.log(`   Pinecone: ${stats.dimension} dimensioner`);
      return;
    }

    // Test 3: Lagra embeddings i Pinecone
    console.log('\n📝 Test 3: Testar att lagra embeddings i Pinecone...');
    const testVectors = embeddings.map((item, i) => ({
      id: `test-${Date.now()}-${i}`,
      values: item.embedding,
      metadata: {
        text: item.text,
        source: 'test',
        type: 'openai-test',
        timestamp: new Date().toISOString()
      }
    }));

    await index.upsert(testVectors);
    console.log('✅ Embeddings lagrade i Pinecone!');

    // Test 4: Sök liknande embeddings
    console.log('\n📝 Test 4: Testar semantisk sökning...');
    const searchQuery = 'vad handlar AI och maskininlärning om?';
    
    const searchResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: searchQuery,
      encoding_format: 'float',
    });

    const searchResults = await index.query({
      vector: searchResponse.data[0].embedding,
      topK: 3,
      includeMetadata: true,
      filter: { type: 'openai-test' }
    });

    console.log('✅ Semantisk sökning fungerar!');
    console.log(`🔍 Sökte efter: "${searchQuery}"`);
    console.log('📋 Resultat:');
    searchResults.matches.forEach((match, i) => {
      console.log(`   ${i + 1}. Score: ${match.score?.toFixed(4)} - "${match.metadata?.text}"`);
    });

    // Rensa upp testdata
    console.log('\n🧹 Rensar upp testdata...');
    const idsToDelete = testVectors.map(v => v.id);
    await index.deleteMany(idsToDelete);
    console.log('✅ Testdata borttagen');

    console.log('\n🎉 Alla tester passerade! OpenAI + Pinecone integration fungerar perfekt!');
    console.log('🚀 Redo för produktion!');

  } catch (error) {
    console.error('❌ Fel vid test:', error.message);
    if (error.response?.data) {
      console.error('📝 API Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testOpenAIEmbeddings();