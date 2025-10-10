/**
 * Test Ollama installation och nomic-embed-text modell
 */

async function testOllamaEmbeddings() {
  console.log('🦙 Testar Ollama nomic-embed-text...');

  try {
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: 'Hej världen! Detta är ett test på svenska.',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Ollama Error:', response.status, errorText);
      console.log('💡 Kör: ollama serve (i en annan terminal)');
      console.log('💡 Kör: ollama pull nomic-embed-text');
      return;
    }

    const data = await response.json();
    console.log('✅ Ollama test lyckad!');
    console.log('📊 Embedding dimensioner:', data.embedding.length);
    console.log('🎯 Model: nomic-embed-text');
    console.log('🔢 Första 5 värden:', data.embedding.slice(0, 5));

  } catch (error) {
    console.log('❌ Anslutningsfel:', error.message);
    console.log('💡 Kontrollera att Ollama körs: ollama serve');
  }
}

testOllamaEmbeddings();