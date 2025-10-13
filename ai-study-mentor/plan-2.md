# 🤖 stage2-plan.md – AI Integration & Advanced Features

## 🎯 Goal

By the end of Stage 2, the system will function as a **smart Swedish-language AI Study Mentor** that can:
- Accept document or link uploads.
- Extract, embed, and semantically search text content.
- Use Viking 7B via Ollama to answer questions and generate study questions in Swedish.

---

## 🧱 Stage 2 – Step-by-Step Plan

### **Stage 2.1 – Document Upload & Text Extraction**

**Objective:** Enable users to upload PDF/text files or paste a link, and extract clean Swedish text.

**Tasks:**
1. Add upload options in UI:  
   - “Ladda upp dokument”  
   - “Klistra in länk”
2. Backend (Next.js API route):
   - Use `multer` for handling uploads.
   - Use `pdf-parse` to extract PDF text.
   - Use `cheerio` to scrape webpage text from URLs.
3. Clean and store extracted text in MongoDB, linked to user ID.
4. Return extracted text in the response for confirmation.

**Checkpoint:**  
✅ Upload → Extracted text displays in UI.

---

### **Stage 2.2 – Text Splitting & Embeddings**

**Objective:** Prepare and store semantic embeddings for later retrieval.

**Tasks:**
1. Use LangChain’s `RecursiveCharacterTextSplitter` to split text (e.g., 1,000-character chunks with 200 overlap).
2. Generate embeddings using LangChain’s embedding model (OpenAI or local).
3. Initialize Pinecone free tier (Serverless index).
4. Store embeddings and metadata (document ID, chunk text) in Pinecone.

**Checkpoint:**  
✅ Pinecone dashboard shows stored vectors under project index.

---

### **Stage 2.3 – Semantic Retrieval & Chat Flow**

**Objective:** Connect Viking 7B (Ollama) with Pinecone for contextual Swedish Q&A.

**Tasks:**
1. Create `/api/chat` endpoint.
2. On user query:
   - Generate embedding of query.
   - Retrieve top-k relevant chunks from Pinecone.
   - Combine chunks into context.
3. Send combined context and query to Viking 7B using LangChain’s `Ollama` interface.
4. Format responses:
   - Max 4 sentences.
   - If info missing → reply:  
     **“Den här informationen finns inte i det uppladdade materialet.”**
5. Display chat bubbles in frontend.

**Checkpoint:**  
✅ Asking “Vad handlar texten om?” returns a short Swedish summary.

---

### **Stage 2.4 – Study Question Generator**

**Objective:** Generate study questions from uploaded material context.

**Tasks:**
1. Add “Generera studiefrågor” button in UI.
2. On click:
   - Retrieve top context chunks.
   - Send to Viking 7B with prompt to create ~10 Swedish questions.
3. Store generated questions in MongoDB.
4. Display results as a numbered list in UI.

**Checkpoint:**  
✅ User sees 10 short, relevant Swedish questions.

---

### **Stage 2.5 – Session History & Persistence**

**Objective:** Save user study sessions and chat history.

**Tasks:**
1. Create `Session` model in MongoDB:
   - `userId`
   - `documentName`
   - `chatHistory`
   - `createdAt`
2. Display session history in a sidebar (“Historik”).
3. Allow users to click and reload past sessions.
4. Maintain persistence after reload.

**Checkpoint:**  
✅ Reload → Previous sessions and chats are restored.

---

### **Stage 2.6 – UI Polish & Final Testing**

**Objective:** Complete UX enhancements and functional validation.

**Tasks:**
1. Refine UI with Tailwind:
   - Smooth scrolling.
   - Light/dark theme.
   - Shadows, rounded corners, and animations.
2. Add localized placeholders:
   - “Ställ en fråga...”
   - “Laddar...”
3. Test across mobile and desktop.
4. Perform end-to-end testing:
   - Upload → Ask → Answer → Generate questions → View history.

**Checkpoint:**  
✅ All flows work smoothly in Swedish with no console errors.

---

## ✅ Stage 2 Completion Criteria

| Feature | Requirement |
|----------|--------------|
| Document Upload | PDF/Link text extraction works |
| RAG Pipeline | LangChain + Pinecone integrated |
| Chatbot | Answers in Swedish via Viking 7B |
| Study Question Generation | Generates ~10 questions per context |
| Session History | Fully functional persistence |
| UI Polish | Clean, responsive, Swedish-language interface |

---

## 🎉 Final Outcome

At the end of Stage 2, the **AI Study Mentor** will:

- Support document uploads and Swedish Q&A.  
- Generate study questions based on uploaded content.  
- Use a complete **RAG pipeline (LangChain + Pinecone + Viking 7B)**.  
- Persist user sessions and history.  
- Present a fully Swedish, clean, responsive interface ready for testing and demos.

---

