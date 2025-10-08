# AI Study Mentor - STAGE 2: AI Features (AI Implementation Guide)

## 🎯 STAGE 2 OVERVIEW
Implement AI-powered document processing, chat functionality, and study features using Viking 7B, LangChain, and Pinecone.

---

## Step 5: File Upload & Document Processing

**GOAL:** Enable PDF/text file uploads, extract text, create embeddings, store in Pinecone vector database.

### 📋 IMPLEMENTATION CHECKLIST:

#### **5.1 Multer Configuration**
- [ ] **Create file:** `src/lib/multer.ts`
- [ ] **Requirements:**
  - Configure storage destination: `uploads/` directory
  - Filename format: `{userId}_{timestamp}_{originalName}`
  - File filter: Accept only `.pdf`, `.txt`, `.docx`
  - Size limit: 10MB maximum
  - Error messages in Swedish: "Filen är för stor", "Filtyp stöds inte"

#### **5.2 Document Processing Utils**
- [ ] **Create file:** `src/lib/documentProcessor.ts`
- [ ] **Requirements:**
  - `extractTextFromPDF(filePath: string)` using pdf-parse
  - `extractTextFromTxt(filePath: string)` for plain text files
  - `splitTextIntoChunks(text: string, chunkSize = 1000, overlap = 200)`
  - `generateEmbeddings(chunks: string[])` using LangChain
  - Error handling with Swedish messages

#### **5.3 Pinecone Integration**
- [ ] **Create file:** `src/lib/pinecone.ts`
- [ ] **Requirements:**
  - Initialize Pinecone client with API key from env
  - `uploadEmbeddingsToPinecone(embeddings, metadata, namespace)`
  - `searchSimilarDocuments(query, topK = 5, namespace)`
  - `deleteDocumentVectors(vectorIds)`
  - Include document metadata: userId, documentId, chunkIndex

#### **5.4 File Upload API Route**
- [ ] **Create file:** `src/app/api/documents/upload/route.ts`
- [ ] **Requirements:**
  - POST method with FormData handling
  - JWT authentication required
  - Validate file type and size
  - Save file to uploads directory
  - Extract text using documentProcessor
  - Split into chunks and generate embeddings
  - Store document in MongoDB with processed status
  - Upload vectors to Pinecone with metadata
  - Return success message in Swedish: "Dokument uppladdat och bearbetat"

#### **5.5 File Upload Component**
- [ ] **Create file:** `src/components/upload/FileUpload.tsx`
- [ ] **Requirements:**
  - Drag & drop zone with "Dra och släpp filer här eller klicka för att välja"
  - File list showing upload progress
  - Accept multiple files
  - Progress bar during upload/processing
  - Success/error messages in Swedish
  - File icons for different types
  - Cancel upload functionality

#### **5.6 Document List Component**
- [ ] **Create file:** `src/components/documents/DocumentList.tsx`
- [ ] **Requirements:**
  - Table layout with columns: "Filnamn", "Storlek", "Datum", "Status", "Åtgärder"
  - Processing status indicators: "Bearbetas...", "Klar", "Fel"
  - Delete document action with confirmation
  - Filter by file type
  - Pagination for large document lists

### ✅ **CHECKPOINT 5:**
- [ ] Can upload PDF files successfully
- [ ] Files are processed and text extracted
- [ ] Embeddings stored in Pinecone
- [ ] Document metadata saved in MongoDB
- [ ] File list displays uploaded documents correctly

---

## Step 6: LangChain Integration + Ollama Setup

**GOAL:** Configure LangChain with Ollama Viking 7B model for Swedish responses with context retrieval.

### 📋 IMPLEMENTATION CHECKLIST:

#### **6.1 Ollama Configuration**
- [ ] **Create file:** `src/lib/ollama.ts`
- [ ] **Requirements:**
  - Initialize Ollama client with base URL from env
  - `testOllamaConnection()` function
  - `generateResponse(prompt: string, context: string)` function
  - Response length limit: 3-4 sentences maximum
  - Swedish language prompt template
  - Error handling for connection issues

#### **6.2 LangChain Chain Setup**
- [ ] **Create file:** `src/lib/langchain.ts`
- [ ] **Requirements:**
  - Text splitter configuration (RecursiveCharacterTextSplitter)
  - Embedding model setup (HuggingFace or OpenAI alternative)
  - Vector store connection to Pinecone
  - Retrieval chain with similarity search
  - Swedish prompt template for context-aware responses

#### **6.3 Context Retrieval Service**
- [ ] **Create file:** `src/lib/contextRetrieval.ts`
- [ ] **Requirements:**
  - `retrieveRelevantContext(query: string, userId: string, documentId?: string)`
  - Semantic search in user's documents
  - Context ranking by relevance score
  - Combine multiple relevant chunks
  - Maximum context length: 2000 characters

#### **6.4 AI Response Generator**
- [ ] **Create file:** `src/lib/aiResponseGenerator.ts`
- [ ] **Requirements:**
  - Main function: `generateStudyResponse(question: string, context: string, language = 'sv')`
  - Swedish prompt template: "Du är en AI studie-assistent. Baserat på följande kontext..."
  - Response validation (length, language)
  - Fallback for when no relevant context found
  - Error handling with Swedish messages

#### **6.5 Test AI Integration**
- [ ] **Create file:** `src/app/api/ai/test/route.ts`
- [ ] **Requirements:**
  - GET endpoint to test Ollama connection
  - Test context retrieval with sample query
  - Test response generation
  - Return status and sample response
  - Include Swedish test query: "Vad handlar dokumentet om?"

### ✅ **CHECKPOINT 6:**
- [ ] Ollama Viking 7B model responds correctly
- [ ] Context retrieval finds relevant document chunks
- [ ] AI responses are in Swedish and appropriately short
- [ ] Test endpoint returns successful AI response

---

## Step 7: Chat API & Real-time Messaging

**GOAL:** Create chat endpoints for conversations with context-aware AI responses and real-time updates.

### 📋 IMPLEMENTATION CHECKLIST:

#### **7.1 Chat API Routes**
- [ ] **Create file:** `src/app/api/chat/route.ts`
- [ ] **Requirements:**
  - POST: Send message and get AI response
  - GET: Retrieve chat history for user
  - JWT authentication required
  - Message validation and sanitization
  - Rate limiting: max 10 messages per minute

#### **7.2 Chat Message Processing**
- [ ] **Create file:** `src/app/api/chat/[sessionId]/route.ts`
- [ ] **Requirements:**
  - POST: Add message to specific chat session
  - GET: Get messages from specific session
  - DELETE: Delete chat session
  - Validate user owns the session
  - Update session timestamp on new messages

#### **7.3 Chat Context State Management**
- [ ] **Create file:** `src/context/ChatContext.tsx`
- [ ] **Requirements:**
  - State: `currentSession`, `sessions`, `messages`, `loading`
  - Functions: `sendMessage()`, `createNewSession()`, `loadSession()`, `deleteSession()`
  - Auto-save message history
  - Optimistic updates for better UX

#### **7.4 Chat Interface Component**
- [ ] **Create file:** `src/components/chat/ChatInterface.tsx`
- [ ] **Requirements:**
  - Message display area with auto-scroll
  - User messages: Right-aligned, blue background
  - AI messages: Left-aligned, gray background
  - Typing indicator during AI response
  - Message timestamps
  - Copy message button

#### **7.5 Message Input Component**
- [ ] **Create file:** `src/components/chat/MessageInput.tsx`
- [ ] **Requirements:**
  - Textarea with "Ställ en fråga om dina dokument..." placeholder
  - Auto-resize on content change
  - Send button (disabled when empty or loading)
  - Keyboard shortcuts: Enter to send, Shift+Enter for new line
  - Character count indicator

#### **7.6 Session Management**
- [ ] **Create file:** `src/components/chat/SessionList.tsx`
- [ ] **Requirements:**
  - List recent chat sessions in sidebar
  - Session titles generated from first message
  - "Ny konversation" button
  - Delete session with confirmation dialog
  - Active session highlighting

### ✅ **CHECKPOINT 7:**
- [ ] Can send messages and receive AI responses
- [ ] Chat history persists between sessions
- [ ] Multiple chat sessions can be managed
- [ ] Real-time message updates work correctly

---

## Step 8: Study Question Generation

**GOAL:** Generate contextual study questions and flashcards based on uploaded documents.

### 📋 IMPLEMENTATION CHECKLIST:

#### **8.1 Question Generation API**
- [ ] **Create file:** `src/app/api/study/questions/route.ts`
- [ ] **Requirements:**
  - POST: Generate questions from document ID
  - Question types: multiple choice, true/false, short answer
  - Difficulty levels: lätt (easy), medel (medium), svår (hard)
  - Generate 10 questions per request
  - Swedish question format

#### **8.2 Question Generator Service**
- [ ] **Create file:** `src/lib/questionGenerator.ts`
- [ ] **Requirements:**
  - `generateMultipleChoice(context: string, count = 5)`
  - `generateTrueFalse(context: string, count = 3)`
  - `generateShortAnswer(context: string, count = 2)`
  - Swedish prompt templates for each question type
  - Answer validation and formatting

#### **8.3 Study Session Component**
- [ ] **Create file:** `src/components/study/StudySession.tsx`
- [ ] **Requirements:**
  - Question display with progress indicator
  - Multiple choice with radio buttons
  - True/false with toggle buttons
  - Short answer with text input
  - "Nästa fråga" and "Föregående fråga" buttons
  - Score tracking and display

#### **8.4 Question Bank Component**
- [ ] **Create file:** `src/components/study/QuestionBank.tsx`
- [ ] **Requirements:**
  - Filter questions by document and difficulty
  - Search functionality
  - Edit/delete questions
  - Export questions as PDF/text
  - "Starta studiesession" button

#### **8.5 Flashcard Component**
- [ ] **Create file:** `src/components/study/Flashcards.tsx`
- [ ] **Requirements:**
  - Card flip animation (question → answer)
  - Navigation: "Föregående kort", "Nästa kort"
  - Difficulty rating: "Lätt", "Medel", "Svår"
  - Spaced repetition algorithm
  - Progress tracking

### ✅ **CHECKPOINT 8:**
- [ ] Questions generate correctly from document content
- [ ] Study session interface works smoothly
- [ ] Flashcards display and flip properly
- [ ] Progress tracking shows correct statistics

---

## Step 9: Chat History & Session Management

**GOAL:** Complete chat history persistence, search functionality, and session organization.

### 📋 IMPLEMENTATION CHECKLIST:

#### **9.1 Advanced Session API**
- [ ] **Create file:** `src/app/api/sessions/route.ts`
- [ ] **Requirements:**
  - GET: List all user sessions with pagination
  - POST: Create new session with optional title
  - PUT: Update session title
  - Search sessions by title or content

#### **9.2 Message Search API**
- [ ] **Create file:** `src/app/api/sessions/search/route.ts`
- [ ] **Requirements:**
  - POST: Search messages across all user sessions
  - Full-text search in message content
  - Date range filtering
  - Results with context and session info
  - Swedish search interface

#### **9.3 Session History Component**
- [ ] **Create file:** `src/components/history/SessionHistory.tsx`
- [ ] **Requirements:**
  - Grouped by date: "Idag", "Igår", "Förra veckan"
  - Session preview with first message
  - Search bar: "Sök i historik..."
  - Export session as text/PDF
  - Bulk delete functionality

#### **9.4 Message Search Component**
- [ ] **Create file:** `src/components/history/MessageSearch.tsx`
- [ ] **Requirements:**
  - Advanced search filters
  - Highlight search terms in results
  - Jump to message in original session
  - Search suggestions
  - "Inga resultat hittades" message

#### **9.5 Chat Statistics**
- [ ] **Create file:** `src/components/history/ChatStats.tsx`
- [ ] **Requirements:**
  - Total messages sent/received
  - Documents uploaded count
  - Study sessions completed
  - Most active time periods
  - Visual charts/graphs

### ✅ **CHECKPOINT 9:**
- [ ] Can search through chat history effectively
- [ ] Session organization works intuitively
- [ ] Statistics display accurate information
- [ ] Export functionality produces correct files

---

## Step 10: Final Polish & Testing

**GOAL:** Complete UI polish, comprehensive testing, error handling, and production readiness.

### 📋 IMPLEMENTATION CHECKLIST:

#### **10.1 Error Boundary Components**
- [ ] **Create file:** `src/components/error/ErrorBoundary.tsx`
- [ ] **Requirements:**
  - Catch and display React errors gracefully
  - "Något gick fel" message in Swedish
  - Reset button to try again
  - Error logging for debugging
  - Fallback UI for broken components

#### **10.2 Loading States & Skeletons**
- [ ] **Create file:** `src/components/ui/LoadingSkeletons.tsx`
- [ ] **Requirements:**
  - Chat message skeleton
  - Document list skeleton
  - Sidebar session skeleton
  - Shimmer animations
  - Proper accessibility labels

#### **10.3 Comprehensive Testing**
- [ ] **Create file:** `src/app/api/test/integration/route.ts`
- [ ] **Requirements:**
  - Test full user workflow: register → login → upload → chat → logout
  - Test error scenarios with Swedish messages
  - Validate all API responses
  - Performance testing for large documents
  - Memory leak detection

#### **10.4 Accessibility Improvements**
- [ ] **Update all components with:**
  - ARIA labels in Swedish
  - Keyboard navigation support
  - Screen reader compatibility
  - Color contrast validation
  - Focus indicators
  - Alt text for all images/icons

#### **10.5 Performance Optimization**
- [ ] **Implement optimizations:**
  - Lazy loading for document content
  - Message virtualization for long chats
  - Image optimization with Next.js
  - Code splitting for components
  - Database query optimization

#### **10.6 Production Configuration**
- [ ] **Update configuration files:**
  - Environment variables validation
  - Security headers configuration
  - Rate limiting implementation
  - Logging system setup
  - Docker configuration (optional)

#### **10.7 Swedish Language Validation**
- [ ] **Complete Swedish text audit:**
  - All UI elements use Swedish text
  - Error messages are in Swedish
  - Placeholder text is in Swedish
  - Success messages are in Swedish
  - AI responses validated for Swedish language

#### **10.8 Final User Testing**
- [ ] **Test complete user workflows:**
  - New user registration and first document upload
  - Chat with AI about uploaded documents
  - Study question generation and completion
  - Multiple document management
  - Theme switching and responsive design

### ✅ **CHECKPOINT 10:**
- [ ] All error states handled gracefully
- [ ] Application performs well under load
- [ ] Swedish language used consistently throughout
- [ ] Accessibility standards met
- [ ] Ready for production deployment

---

## 🎯 **STAGE 2 COMPLETION CRITERIA**

✅ **All checkpoints passed**
✅ **AI chat functionality working with Swedish responses**
✅ **Document processing and vector search operational**
✅ **Study features generate relevant questions**
✅ **Performance optimized for production**
✅ **Complete Swedish language implementation**
✅ **Comprehensive error handling**

**Final Result:** Fully functional AI Study Mentor application ready for Swedish-speaking students to upload documents and interact with AI-powered study assistance.