/**
 * Enkel test av Pinecone Inference API
 */

async function testPineconeEmbeddings() {
  const apiKey = process.env.PINECONE_API_KEY;
  
  if (!apiKey) {
    console.log('❌ PINECONE_API_KEY saknas i .env.local');
    return;
  }

  console.log('🧪 Testar Pinecone Inference API...');
  console.log('📍 API Key:', apiKey.substring(0, 20) + '...');

  try {
    const response = await fetch('https://api.pinecone.io/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'multilingual-e5-large',
        inputs: ['Hej världen! Detta är ett test.'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API Error:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Test lyckad!');
    console.log('📊 Embedding dimensioner:', data.data[0].values.length);
    console.log('🎯 Model: multilingual-e5-large');
    console.log('🔢 Första 5 värden:', data.data[0].values.slice(0, 5));

  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

// Kör test
require('dotenv').config({ path: '.env.local' });
testPineconeEmbeddings();