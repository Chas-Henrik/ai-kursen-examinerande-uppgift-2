import { processDocument } from './src/lib/documentProcessor.js';
import { uploadEmbeddingsToPinecone } from './src/lib/pinecone.js';
import path from 'path';

async function testFullDocumentPipeline() {
  console.log('🚀 Testar fullständig document pipeline...');
  
  try {
    const testFilePath = path.join(process.cwd(), 'test-dokument.txt');
    
    // Steg 1: Bearbeta dokument
    console.log('📄 Steg 1: Bearbetar dokument...');
    const documentData = await processDocument(testFilePath);
    
    console.log('✅ Dokument bearbetat framgångsrikt!');
    console.log(`📊 Antal chunks: ${documentData.chunks.length}`);
    console.log(`🔢 Antal embeddings: ${documentData.embeddings.length}`);
    console.log(`📏 Embedding dimensioner: ${documentData.embeddings[0]?.length}`);
    console.log(`📝 Total tecken: ${documentData.metadata.totalCharacters}`);
    
    // Visa exempel på chunks
    console.log('\n📋 Exempel på chunks:');
    documentData.chunks.slice(0, 2).forEach((chunk, i) => {
      console.log(`   ${i + 1}. "${chunk.substring(0, 100)}..."`);
    });
    
    // Steg 2: Ladda upp till Pinecone
    console.log('\n🔄 Steg 2: Laddar upp embeddings till Pinecone...');
    
    const testMetadata = {
      userId: 'test-user-123',
      fileName: 'test-dokument.txt',
      fileType: '.txt',
      uploadDate: new Date(),
      chunkCount: documentData.chunks.length,
      fileSize: 1000,
    };
    
    await uploadEmbeddingsToPinecone(
      documentData.embeddings,
      documentData.chunks,
      testMetadata,
      'test-user-123' // namespace
    );
    
    console.log('✅ Embeddings uppladdade till Pinecone!');
    
    console.log('\n🎉 PIPELINE TEST LYCKAD!');
    console.log('📋 Sammanfattning:');
    console.log(`   ✓ Text extraherad från: ${documentData.metadata.fileName}`);
    console.log(`   ✓ ${documentData.chunks.length} chunks skapade`);
    console.log(`   ✓ ${documentData.embeddings.length} embeddings genererade med Ollama`);
    console.log(`   ✓ Alla embeddings lagrade i Pinecone`);
    console.log(`   ✓ Metadata sparad`);
    
  } catch (error) {
    console.error('❌ Pipeline test misslyckad:', error.message);
    console.error('Fullständig fel:', error);
  }
}

// Kör test om det inte finns andra fel
testFullDocumentPipeline();