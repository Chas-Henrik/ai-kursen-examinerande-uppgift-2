const { Pinecone } = require('@pinecone-database/pinecone');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function testDocumentProcessingSimple() {
  console.log('🧪 Testar enkel dokumentprocessering och Ollama + Pinecone integration...');
  
  try {
    // Test 1: Läs testfil
    console.log('📄 Läser testfil...');
    const testText = fs.readFileSync('test-dokument.txt', 'utf-8');
    console.log(`✅ Fil läst: ${testText.length} tecken`);
    
    // Test 2: Skapa enkla chunks
    const chunks = testText.split('\n\n').filter(chunk => chunk.trim().length > 0);
    console.log(`📝 Skapade ${chunks.length} chunks`);
    
    // Test 3: Generera embeddings med Ollama
    console.log('🦙 Genererar embeddings med Ollama...');
    const ollamaUrl = 'http://localhost:11434';
    const embeddings = [];
    
    for (const [i, chunk] of chunks.entries()) {
      console.log(`   Bearbetar chunk ${i + 1}/${chunks.length}...`);
      
      const response = await fetch(`${ollamaUrl}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'nomic-embed-text',
          prompt: chunk.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama fel: ${response.status}`);
      }

      const data = await response.json();
      embeddings.push(data.embedding);
    }
    
    console.log(`✅ ${embeddings.length} embeddings genererade!`);
    console.log(`📏 Embedding dimensioner: ${embeddings[0].length}`);
    
    // Test 4: Ladda upp till Pinecone
    console.log('📊 Laddar upp till Pinecone...');
    
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    const index = pc.index('ai-study-mentor');
    
    // Förbered vektorer
    const vectors = embeddings.map((embedding, i) => ({
      id: `test-${Date.now()}-${i}`,
      values: embedding,
      metadata: {
        text: chunks[i],
        source: 'test-pipeline',
        chunkIndex: i,
        timestamp: new Date().toISOString(),
      },
    }));
    
    await index.namespace('test-pipeline').upsert(vectors);
    
    console.log('✅ Embeddings lagrade i Pinecone!');
    
    // Test 5: Test sökning
    console.log('🔍 Testar semantisk sökning...');
    const searchQuery = 'Vad är artificiell intelligens?';
    
    // Generera embedding för sökfrågan
    const searchResponse = await fetch(`${ollamaUrl}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: searchQuery,
      }),
    });
    
    const searchData = await searchResponse.json();
    
    // Sök i Pinecone
    const searchResults = await index.namespace('test-pipeline').query({
      vector: searchData.embedding,
      topK: 3,
      includeMetadata: true,
    });
    
    console.log('🎯 Sökresultat:');
    searchResults.matches.forEach((match, i) => {
      console.log(`   ${i + 1}. Score: ${match.score.toFixed(4)}`);
      console.log(`      Text: "${match.metadata.text.substring(0, 100)}..."`);
    });
    
    // Rensa upp
    console.log('🧹 Rensar upp testdata...');
    const idsToDelete = vectors.map(v => v.id);
    await index.namespace('test-pipeline').deleteMany(idsToDelete);
    
    console.log('\n🎉 FULLSTÄNDIG PIPELINE TEST LYCKAD!');
    console.log('✅ Alla komponenter fungerar:');
    console.log('   • Text läsning och chunking');
    console.log('   • Ollama embedding generering');
    console.log('   • Pinecone vector lagring');
    console.log('   • Semantisk sökning');
    console.log('   • Data cleanup');
    
  } catch (error) {
    console.error('❌ Pipeline test misslyckad:', error.message);
  }
}

testDocumentProcessingSimple();