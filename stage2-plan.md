# **🤖 stage2-plan.md – AI Integration & Advanced Features**

## **Goal**

Build a smart Swedish-language **AI Study Mentor** that helps users study their own material.  
Users can upload a document or link, the system extracts the text, and the Viking 7B model (via Ollama) answers questions or generates study questions based on that content.

---

## **Project Description**

The AI Study Mentor is a web-based learning assistant that helps students understand and review study materials in Swedish.  
The system automatically behaves like a supportive “studiementor”:

* Answers questions briefly and clearly (2–4 sentences).  
* Encourages the user to ask follow-up questions.  
* If the answer is missing, it says:  
  **“Den här informationen finns inte i det uppladdade materialet.”**

This stage introduces **Retrieval-Augmented Generation (RAG)** using **LangChain \+ Pinecone**:

1. Extract text from uploaded content.  
2. Split text into smaller chunks.  
3. Create embeddings through LangChain.  
4. Store them in Pinecone.  
5. Retrieve relevant chunks when the user interacts.  
6. Pass them to Viking 7B via Ollama for contextual, Swedish answers.

---

## **Tech Stack**

| Layer | Technology | Description |
| ----- | ----- | ----- |
| Language | TypeScript | Shared across the stack |
| Frontend | Next.js \+ Tailwind CSS | Handles file upload, chat, and results |
| Backend | Node.js (Next.js API Routes) | File handling, text extraction, LangChain pipeline |
| LLM | Viking 7B via Ollama | Local Swedish-language model |
| Database | MongoDB Atlas | Stores user data, documents, and chat history |
| Vector DB | Pinecone | Stores embeddings for semantic search |
| AI Framework | LangChain | Handles document loading, splitting, embeddings, and retrieval |
| Libraries | pdf-parse, cheerio, multer, axios | Used for uploads, scraping, and parsing |

---

## **Languages**

* **UI:** Fully in Swedish  
* **Model Input:** Accepts both Swedish and English text  
* **Model Output:** Always responds in Swedish

---

## **Functionality (Stage 2\)**

### **5️⃣ Upload (PDF / Text / Link)**

* UI: “Ladda upp dokument” or “Klistra in länk.”  
* Backend receives file or URL.  
* Use:  
  * `fs` → read `.pdf` files  
  * `pdf-parse` → extract PDF text  
  * `cheerio` → scrape webpage text  
* Clean and save text to MongoDB (linked to user).

**Checkpoint:**  
Upload → see extracted text returned in response.

---

### **6️⃣ Embeddings & Semantic Search**

* Split text using LangChain `RecursiveCharacterTextSplitter`.  
* Create embeddings via LangChain’s embedding class.  
* Store vector embeddings in Pinecone.  
* On question input, retrieve only the most relevant chunks.

**Checkpoint:**  
Confirm embeddings stored in Pinecone (check index dashboard).

---

### **7️⃣ Chat Interface (Viking 7B via Ollama)**

* Create API route `/api/chat`.  
* Query flow:  
  1. Retrieve top relevant chunks from Pinecone.  
  2. Combine them into a short context string.  
  3. Send prompt → Viking 7B through LangChain’s `Ollama` LLM interface.  
  4. Response appears in the chat UI.

**Prompt Example:**

`Du är en svensk studiementor.`   
`Svara kort och tydligt (max 4 meningar).`  
`Om informationen inte finns, svara: "Den här informationen finns inte i det uppladdade materialet."`  
`Fråga: {{userQuestion}}`  
`Text: {{context}}`

**Checkpoint:**  
Ask “Vad handlar texten om?” → short Swedish summary appears.

---

### **8️⃣ Study Question Generator**

* Add button “Generera studiefrågor.”  
* Use same retrieved context to generate \~10 questions.  
* Display as list in UI.  
* Store in MongoDB under user session.

**Checkpoint:**  
Click → see 10 short, relevant Swedish questions.

---

### **9️⃣ History & Sessions**

* Create `Session` model (userId, documentName, chatHistory, createdAt).  
* Sidebar “Historik” lists previous sessions.  
* Click → loads old chat/questions.

**Checkpoint:**  
Reload app → confirm sessions persist.

---

### **🔟 Final Design Polish & Testing**

* Add smooth scrolling, animations, and shadows.  
* Test responsive layout (mobile & desktop).  
* Ensure Swedish placeholders (“Ställ en fråga...”, “Laddar...”).  
* Run through complete user flow.

**Checkpoint:**  
Upload → Ask → Get answers → Generate study questions → View history.  
All in Swedish, no console errors.

---

## **✅ End of Stage 2**

At this point, the AI Study Mentor:

* Fully supports document upload and Swedish-language Q\&A  
* Generates study questions  
* Uses RAG pipeline (LangChain \+ Pinecone \+ Viking 7B)  
* Stores sessions and user data in MongoDB  
* Provides a clean, light/dark themed interface

🎉 **Final Outcome:**  
A fully functional, Swedish-language AI Study Mentor web app ready for testing, presentation, and further expansion (e.g., flashcards or progress tracking).

