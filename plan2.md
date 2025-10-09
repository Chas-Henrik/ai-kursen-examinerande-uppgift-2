# plan-stage-2.md

## 🎯 Mål
Bygg en smart, svenskspråkig **AI Studiementor** som hjälper användare att studera sitt eget material.  
Användaren kan ladda upp ett dokument eller klistra in en länk, systemet extraherar texten, och **Viking 7B** (via **Ollama**) svarar på frågor eller genererar studiefrågor baserat på innehållet.

---

## 🧠 Projektbeskrivning
AI Studiementorn är en webbaserad lärandeassistent på svenska.  
Systemet ska:
- Svara kort och tydligt (2–4 meningar).  
- Uppmuntra användaren att ställa följdfrågor.  
- Om svaret saknas, svara:  
  **"Den här informationen finns inte i det uppladdade materialet."**

Detta steg introducerar **RAG (Retrieval-Augmented Generation)** med **LangChain + Pinecone**:
1. Extrahera text från uppladdat material.  
2. Dela texten i mindre chunkar.  
3. Skapa embeddings via **Hugging Face modellen “sentence-transformers/all-MiniLM-L6-v2”**.  
4. Lagra embeddings i **Pinecone**.  
5. Hämta relevanta textstycken vid frågor.  
6. Skicka kontexten till **Viking 7B via Ollama** för svenska svar.

---

## ⚙️ Tech Stack

| Lager | Teknologi | Beskrivning |
|-------|------------|-------------|
| **Språk** | TypeScript | Delas mellan frontend och backend |
| **Frontend** | Next.js + Tailwind CSS | UI, filuppladdning, chatt och visning |
| **Backend** | Node.js (Next.js API Routes) | Filhantering, textutvinning, LangChain-pipeline |
| **LLM** | Viking 7B via Ollama | Lokal svensk språkmodell |
| **Databas** | MongoDB Atlas | Lagrar användare, dokument, chattar |
| **Vector DB** | Pinecone | Lagrar embeddings för semantisk sökning |
| **AI Framework** | LangChain | Hanterar laddning, splittring, embeddings och retrieval |
| **Bibliotek** | ptf-ts, cheerio, multer, axios | Hanterar filuppladdning, scraping, parsing |

---

## 🌍 Språkpolicy
- **UI:** Helt på svenska  
- **Input:** Kan vara svenska eller engelska  
- **Output:** Alltid på svenska  

---

## 🪜 Steg-för-steg plan

### 5️⃣ Upload (PDF / Text / Länk)
**Mål:** Tillåt användaren att ladda upp PDF/text eller ange URL.  
- UI: “Ladda upp dokument” eller “Klistra in länk”.  
- Backend: `/api/upload` tar emot fil eller URL.  
- Använd:
  - `pdf-ts` → extrahera text från PDF  
  - `cheerio` → hämta och rensa text från webbsidor  
- Rensa text och spara till MongoDB (`Document`-modell).  

**Checkpoint:**  
✔️ Upload → extraherad text returneras i svaret.

---

### 6️⃣ Embeddings & Semantic Search
**Mål:** Skapa och lagra embeddings i Pinecone.  
- Dela texten i chunkar med `RecursiveCharacterTextSplitter` (LangChain).  
- Skapa embeddings via:  
  `"sentence-transformers/all-MiniLM-L6-v2"`.  
- Lagra vektorer i Pinecone med metadata (documentId, chunkIndex, snippet).  
- Använd samma embeddingsmetod vid fråga.

**Checkpoint:**  
✔️ Embeddings lagrade och verifierade i Pinecone-index.

---

### 7️⃣ Chat Interface (Viking 7B via Ollama)
**Mål:** Integrera svensk konversations-LLM.  
- Endpoint: `/api/chat`  
- Flöde:
  1. Hämta relevanta chunkar från Pinecone.  
  2. Bygg svensk prompt:  
     ```
     Du är en svensk studiementor. 
     Svara kort och tydligt (max 4 meningar). 
     Om informationen inte finns, svara: "Den här informationen finns inte i det uppladdade materialet."
     Fråga: {{userQuestion}}
     Text: {{context}}
     ```
  3. Skicka till Viking 7B via Ollama.  
  4. Returnera svaret till frontend.  

**Checkpoint:**  
✔️ “Vad handlar texten om?” → kort svensk sammanfattning visas.

---

### 8️⃣ Studiefrågor
**Mål:** Generera 10 studiefrågor på svenska.  
- UI: Knapp “Generera studiefrågor”.  
- Backend: `/api/generate-questions` använder samma retrieval som chat.  
- Prompt: “Generera 10 korta, relevanta studiefrågor på svenska utifrån texten.”  
- Visa listan i UI och spara i MongoDB under session.  

**Checkpoint:**  
✔️ Klick → 10 frågor visas och sparas i session.

---

### 9️⃣ Historik & Sessioner
**Mål:** Möjliggör återupptagning av tidigare konversationer.  
- Modell: `Session` (userId, documentName, chatHistory, questions, createdAt).  
- Sidebar: “Historik” visar tidigare sessioner.  
- Klick → laddar gammal konversation.  
- API-routes: `/api/sessions` (list, get, delete).  

**Checkpoint:**  
✔️ Appen laddar tidigare sessioner efter omstart.

---

### 🔟 Design & Testning
**Mål:** Slutpolish och validering.  
- UI på svenska med mörkt/ljust tema.  
- Placeholder: “Ställ en fråga...”, “Laddar...”.  
- Testa hela flödet:
  1. Ladda upp dokument  
  2. Generera embeddings  
  3. Ställ fråga  
  4. Få svar från Viking 7B  
  5. Generera studiefrågor  
  6. Visa historik  
- Inga konsolfel.  
- API-säkerhet: inga nycklar i klienten.

**Checkpoint:**  
✔️ Hela appen fungerar fullt ut på svenska utan fel.

---

## ✅ Leveranskrav för Stage 2

| Delmoment | Krav |
|------------|------|
| Upload | PDF/länk extrahering fungerar |
| Embeddings | Skapas via all-MiniLM-L6-v2 |
| Pinecone | Index med relevanta vektorer |
| Chat | Svenska svar via Viking 7B (Ollama) |
| Saknad info | Svarar exakt: “Den här informationen finns inte i det uppladdade materialet.” |
| Studiefrågor | 10 relevanta frågor genereras |
| Historik | Sessioner sparas och laddas korrekt |
| UI | Svenska, responsivt, utan konsolfel |

---

## 💡 Rekommendationer
- Kör Ollama lokalt med Viking 7B (t.ex. `ollama run viking:7b`).  
- Pinecone-index dimension = 384 (för all-MiniLM-L6-v2).  
- Hugging Face embeddings kan köras gratis lokalt med `@xenova/transformers`.  
- Cacha embeddings för att spara tid.  
- Testa flödet i `npm run dev` innan Stage 3.

---

## 🧩 Slutresultat
När Stage 2 är klar ska systemet:
- Acceptera dokument eller länk  
- Extrahera och analysera text  
- Använda RAG (LangChain + Pinecone)  
- Svara på svenska med Viking 7B via Ollama  
- Generera studiefrågor  
- Spara sessioner  
- Köra smidigt lokalt  

🎉 **Redo för testning, demo och vidare utveckling (flashcards, progress tracking, m.m.)**