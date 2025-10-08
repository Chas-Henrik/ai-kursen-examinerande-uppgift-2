# AI Study Mentor - STAGE 2: Avancerad Funktionalitet

## Step 1: Filuppladdning (PDF/TXT/URL) och textextrahering

**Beskrivning**: Implementera filuppladdning, textextrahering från olika källor och chunking för semantic search.

#### 📋 Checklista:

- [ ] **File Upload UI Komponenter**

  - [ ] `src/components/upload/UploadArea.tsx`

    - [ ] Drag & drop zon med svensk text "Dra och släpp din fil här"
    - [ ] File input för PDF och TXT filer
    - [ ] URL input-fält för webblänkar
    - [ ] Progress bar under uppladdning
    - [ ] File validation (max 10MB, endast PDF/TXT)

  - [ ] `src/components/upload/FilePreview.tsx`
    - [ ] Visa uppladdad fil information
    - [ ] "Ta bort fil" knapp
    - [ ] Processing status indicator

- [ ] **API Route för File Upload**

  - [ ] `src/app/api/upload/route.ts`
    - [ ] POST: Hantera multipart/form-data med `multer`
    - [ ] Validera filtyp och storlek
    - [ ] Spara fil tillfälligt på servern
    - [ ] Returnera file ID för processing

- [ ] **Text Extraction Library**

  - [ ] `src/lib/textExtraction.ts`
    - [ ] `extractFromPDF(filePath)` med `pdf-parse`
    - [ ] `extractFromTXT(filePath)` med `fs.readFile`
    - [ ] `extractFromURL(url)` med `cheerio` + `axios`
    - [ ] Text cleaning: ta bort extra whitespace, special chars
    - [ ] Support för både svenska och engelska texter

- [ ] **Text Chunking System**

  - [ ] `src/lib/textChunking.ts`
    - [ ] `chunkText(text, maxTokens=500)` funktion
    - [ ] Smart chunking på menings-gränser
    - [ ] Overlap mellan chunks (50 tokens)
    - [ ] Metadata för varje chunk (index, length, source)

- [ ] **Document Processing Workflow**
  - [ ] Efter upload → extract text → chunk text → spara i MongoDB
  - [ ] `src/lib/documentProcessor.ts`
  - [ ] Background processing med status updates
  - [ ] Error handling för corrupt files

#### ✅ Checkpoint:

Kan ladda upp PDF/TXT/URL, extrahera text korrekt, dela i chunks och spara i databas

---

## Step 2: LangChain + Ollama + Pinecone för embeddings och retrieval

**Beskrivning**: Integrera LangChain, Pinecone vector databas och Ollama för embeddings och semantisk sökning.

#### 📋 Checklista:

- [ ] **Pinecone Vector Database Setup**

  - [ ] Skapa Pinecone konto och få API key
  - [ ] Skapa ny index med dimensioner för nomic-embed-text (768d)
  - [ ] Konfigurera metric type (cosine similarity)
  - [ ] Testa connection från applikationen

- [ ] **Ollama Setup för Embeddings**

  - [ ] Installera Ollama lokalt
  - [ ] Hämta `nomic-embed-text` modell: `ollama pull nomic-embed-text`
  - [ ] Testa embeddings API: `http://localhost:11434/api/embeddings`
  - [ ] Konfigurera i `.env.local`

- [ ] **LangChain Integration**

  - [ ] `src/lib/embeddings.ts`

    - [ ] Konfigurera Ollama embeddings med LangChain
    - [ ] `generateEmbeddings(textChunks[])` funktion
    - [ ] Batch processing för många chunks
    - [ ] Error handling och retry logic

  - [ ] `src/lib/vectorStore.ts`
    - [ ] LangChain Pinecone wrapper setup
    - [ ] `storeEmbeddings(chunks, embeddings, documentId)`
    - [ ] Metadata: documentId, chunkIndex, userId
    - [ ] `deleteDocumentVectors(documentId)` för cleanup

- [ ] **Semantic Retrieval System**

  - [ ] `src/lib/retrieval.ts`
    - [ ] `semanticSearch(query, userId, topK=5)`
    - [ ] Skapa query embedding från user fråga
    - [ ] Sök i Pinecone med filters (userId)
    - [ ] Returnera relevanta text chunks med scores
    - [ ] Threshold för relevance (minsta score)

- [ ] **Document Processing Pipeline**
  - [ ] Efter text chunking → skapa embeddings → lagra i Pinecone
  - [ ] Link mellan MongoDB Document och Pinecone vectors
  - [ ] Background processing med progress tracking

#### ✅ Checkpoint:

Embeddings skapas och lagras i Pinecone, semantisk sökning returnerar relevanta chunks

---

## Step 3: Chat API med Viking 7B (korta svenska svar)

**Beskrivning**: Skapa chat endpoint som använder retrieved context och Viking 7B för svenska svar.

#### 📋 Checklista:

- [ ] **Ollama Viking 7B Setup**

  - [ ] Hämta Viking 7B modell: `ollama pull viking:7b`
  - [ ] Testa modellen lokalt: `ollama run viking:7b`
  - [ ] Konfigurera model parameters (temperature, max_tokens)
  - [ ] Verifiera svenska språkstöd

- [ ] **System Prompt för Studiementor**

  - [ ] `src/lib/prompts.ts`
  - [ ] System prompt enligt specifikation:

  ```
  Du är en hjälpsam och vänlig studiementor som alltid svarar på svenska.
  Besvara frågor endast baserat på den medföljande texten.
  Om informationen inte finns i texten, svara:
  "Den här informationen finns inte i det uppladdade materialet."
  Håll dina svar korta (max 3–4 meningar) och uppmuntra användaren att ställa fler frågor.
  ```

- [ ] **Chat API Route**

  - [ ] `src/app/api/chat/route.ts`
    - [ ] POST: Ta emot `message`, `sessionId`, `documentId`
    - [ ] Verifiera att user äger document
    - [ ] Utför semantic search för relevanta chunks
    - [ ] Bygg prompt med context + user question
    - [ ] Anropa Viking 7B via Ollama
    - [ ] Spara user message + AI response i ChatSession
    - [ ] Returnera AI svar

- [ ] **LangChain Prompt Chain**

  - [ ] `src/lib/chatChain.ts`
  - [ ] LangChain prompt template
  - [ ] Context injection från retrieved chunks
  - [ ] Output parser för clean responses
  - [ ] Fallback för irrelevanta frågor

- [ ] **Chat UI Implementation**

  - [ ] `src/components/chat/ChatInterface.tsx`

    - [ ] Real-time message list med scroll-to-bottom
    - [ ] User/Assistant message bubbles med olika styling
    - [ ] Input field med "Ställ en fråga..." placeholder
    - [ ] "Skicka" knapp med loading state
    - [ ] Typing indicator under AI processing

  - [ ] `src/components/chat/MessageBubble.tsx`
    - [ ] User messages: höger-alignerade, blå bakgrund
    - [ ] Assistant messages: vänster-alignerade, grå bakgrund
    - [ ] Timestamps och copy-to-clipboard funktionalitet
    - [ ] Markdown rendering för formaterad text

- [ ] **Error Handling & Edge Cases**
  - [ ] Inget document uppsatt: "Ladda upp ett dokument först"
  - [ ] Ingen relevant information: automatiskt fallback svar
  - [ ] API errors: "Ett fel uppstod, försök igen"
  - [ ] Rate limiting för excessive requests

#### ✅ Checkpoint:

Chat fungerar med korta svenska svar baserat på uploaded document context

---

## Step 4: Studiefrågor-generator (AI skapar svenska frågor)

**Beskrivning**: AI analyserar uploaded material och genererar relevanta svenska studiefrågor.

#### 📋 Checklista:

- [ ] **Question Generation Prompt**

  - [ ] `src/lib/questionPrompts.ts`
  - [ ] System prompt för fråge-generering:

  ```
  Baserat på den medföljande texten, skapa 10-15 korta och relevanta studiefrågor på svenska.
  Inkludera olika typer:
  - Faktafrågor (Vad är...?)
  - Förståelsefrågor (Varför...?)
  - Analysfrågor (Hur påverkar...?)
  Formulera frågorna som en numrerad lista.
  ```

- [ ] **Question Generation API**

  - [ ] `src/app/api/questions/generate/route.ts`
    - [ ] POST: Ta emot `documentId`
    - [ ] Hämta key chunks från document (första 5-10 chunks)
    - [ ] Anropa Viking 7B med question prompt
    - [ ] Parse generated questions från response
    - [ ] Spara questions i MongoDB (länkade till document)
    - [ ] Returnera question list

- [ ] **Question Model & Schema**

  - [ ] `src/models/StudyQuestion.ts`
  - [ ] Schema: `documentId`, `userId`, `questions[]`, `generatedAt`
  - [ ] Question type: `text`, `type` ('fact'|'understanding'|'analysis')
  - [ ] Methods för CRUD operations

- [ ] **Questions UI Components**

  - [ ] `src/components/questions/QuestionsList.tsx`

    - [ ] "Generera studiefrågor" knapp
    - [ ] Loading state under generation
    - [ ] Numrerad lista över frågor
    - [ ] "Generera nya frågor" för refresh

  - [ ] `src/components/questions/QuestionCard.tsx`
    - [ ] Individual question display
    - [ ] Question type badge (Fakta/Förståelse/Analys)
    - [ ] "Ställ fråga till AI" knapp (öppnar chat med pre-filled)
    - [ ] Bookmark/save functionality

- [ ] **Integration med Chat**

  - [ ] Click på fråga → auto-fyll chat input
  - [ ] "Besvara denna fråga" workflow
  - [ ] Link mellan generated questions och chat responses

- [ ] **Advanced Question Features**
  - [ ] Olika svårighetsgrader baserat på text complexity
  - [ ] Question categorization och filtering
  - [ ] Export questions som PDF/text file

#### ✅ Checkpoint:

AI genererar relevanta svenska studiefrågor från uploaded document

---

## Step 5: Historik och user session persistence

**Beskrivning**: Spara och visa användarens tidigare chattsessioner och uppladdade dokument.

#### 📋 Checklista:

- [ ] **Session Management System**

  - [ ] Ny ChatSession skapas vid varje document upload
  - [ ] Auto-genererad session titel från document namn
  - [ ] All chat messages sparas i session
  - [ ] Session status tracking (active/archived)

- [ ] **History API Routes**

  - [ ] `src/app/api/sessions/route.ts`

    - [ ] GET: Lista alla user sessions (paginated)
    - [ ] POST: Skapa ny session
    - [ ] Sessions sorted by lastActivity

  - [ ] `src/app/api/sessions/[sessionId]/route.ts`

    - [ ] GET: Hämta specific session med alla messages
    - [ ] PUT: Uppdatera session (titel, status)
    - [ ] DELETE: Ta bort session och associated data

  - [ ] `src/app/api/sessions/[sessionId]/messages/route.ts`
    - [ ] GET: Paginated messages för session
    - [ ] POST: Lägg till nytt message i session

- [ ] **History UI Components**

  - [ ] `src/components/history/SessionSidebar.tsx`

    - [ ] Lista över alla user sessions i sidebar
    - [ ] Session titel, datum, message count
    - [ ] Active session highlighting
    - [ ] "Ny Konversation" knapp at top

  - [ ] `src/components/history/SessionItem.tsx`
    - [ ] Individual session med click-to-open
    - [ ] Context menu: "Byt namn", "Ta bort", "Arkivera"
    - [ ] Last message preview
    - [ ] Unread indicator

- [ ] **Session Navigation & State**

  - [ ] `src/context/SessionContext.tsx`
  - [ ] Current active session state
  - [ ] Switch between sessions utan page reload
  - [ ] Auto-save när user skriver messages

- [ ] **Data Management & Cleanup**

  - [ ] Pagination för stora historik (lazy loading)
  - [ ] Search/filter i session history
  - [ ] Bulk operations: delete old sessions
  - [ ] Export session history som text/JSON

- [ ] **Session Restoration**
  - [ ] När user clicks på old session → load full chat
  - [ ] Restore document context för continued chat
  - [ ] Maintain scroll position och UI state

#### ✅ Checkpoint:

User kan se, öppna och fortsätta tidigare chat sessions från sidebar

---

## Step 6: Final UI polish, testing och deployment tips

**Beskrivning**: Finputsning av UI/UX, testing, performance optimization och deployment-förberedelser.

#### 📋 Checklista:

### **UI/UX Polish & Accessibility**

- [ ] **Enhanced User Experience**

  - [ ] Smooth transitions och animations
  - [ ] Loading skeletons för alla components
  - [ ] Empty states med helpful messaging på svenska
  - [ ] Confirmation dialogs för destructive actions
  - [ ] Keyboard shortcuts (Ctrl+Enter för send, etc.)

- [ ] **Mobile Responsiveness**

  - [ ] Sidebar collapse/expand på mobile
  - [ ] Touch-friendly buttons och gestures
  - [ ] Mobile chat input optimizations
  - [ ] Responsive typography och spacing

- [ ] **Accessibility (a11y)**
  - [ ] Proper ARIA labels på svenska
  - [ ] Keyboard navigation för all functionality
  - [ ] Screen reader compatibility
  - [ ] Color contrast compliance
  - [ ] Focus indicators och skip links

### **Performance Optimization**

- [ ] **Frontend Optimization**

  - [ ] Lazy loading för chat history
  - [ ] Image optimization för avatars/icons
  - [ ] Bundle analysis med `@next/bundle-analyzer`
  - [ ] Code splitting för different routes
  - [ ] Memoization för expensive components

- [ ] **Backend Optimization**
  - [ ] Database indexing för frequently queried fields
  - [ ] API response caching strategies
  - [ ] Pagination för large datasets
  - [ ] Background job processing för embeddings
  - [ ] Rate limiting implementation

### **Testing & Quality Assurance**

- [ ] **Unit Testing**

  - [ ] Test utilities funktioner (JWT, text extraction)
  - [ ] Test MongoDB models och schemas
  - [ ] Test API route handlers
  - [ ] Jest + Testing Library setup

- [ ] **Integration Testing**

  - [ ] Test auth flow end-to-end
  - [ ] Test file upload → processing → chat workflow
  - [ ] Test session management
  - [ ] API route integration tests

- [ ] **User Acceptance Testing**
  - [ ] Test på olika browsers (Chrome, Firefox, Safari)
  - [ ] Test på mobile devices
  - [ ] Test med real PDF documents
  - [ ] Performance testing med large files

### **Security & Error Handling**

- [ ] **Security Hardening**

  - [ ] Input validation och sanitization
  - [ ] File upload security (virus scanning)
  - [ ] Rate limiting för API endpoints
  - [ ] CORS policy configuration
  - [ ] Environment variable security audit

- [ ] **Error Boundaries & Logging**
  - [ ] React Error Boundaries för UI crashes
  - [ ] Centralized error logging
  - [ ] User-friendly error messages på svenska
  - [ ] 404 och 500 error pages

### **Deployment Preparation**

- [ ] **Production Configuration**

  - [ ] Environment-specific configs
  - [ ] Production MongoDB cluster setup
  - [ ] Production Pinecone index
  - [ ] CDN setup för static assets

- [ ] **Deployment Platforms**

  - [ ] Vercel deployment configuration
  - [ ] Docker containerization (optional)
  - [ ] Environment variables setup
  - [ ] Database migration scripts

- [ ] **Monitoring & Analytics**
  - [ ] Application performance monitoring
  - [ ] Error tracking (Sentry integration)
  - [ ] User analytics (anonymous usage stats)
  - [ ] Health check endpoints

### **Documentation & Maintenance**

- [ ] **Documentation**

  - [ ] API documentation med OpenAPI/Swagger
  - [ ] User manual på svenska
  - [ ] Developer setup guide
  - [ ] Troubleshooting guide

- [ ] **Maintenance Planning**
  - [ ] Backup strategies för MongoDB
  - [ ] Update procedures för dependencies
  - [ ] Performance monitoring dashboards
  - [ ] User feedback collection system

#### ✅ Final Checkpoint:

Komplett, polerad och produktionsklar AI Study Mentor applikation

---

## 🎯 Slutresultat: Funktionell AI Study Mentor

### ✅ Uppnådda Funktioner:

- **Filuppladdning**: PDF, TXT, URL support med textextrahering
- **Semantisk Sökning**: LangChain + Pinecone + Ollama embeddings
- **AI Chat**: Viking 7B svenska svar baserat på dokument-context
- **Studiefrågor**: Automatisk generering av relevanta frågor
- **Autentisering**: JWT-baserad user management
- **Historik**: Persistent chat sessions och dokument
- **UI/UX**: Responsiv design med light/dark mode på svenska
- **Performance**: Optimerad för snabb respons och skalbarhet

### 🔧 Teknikstack:

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Node.js
- **Database**: MongoDB Atlas + Mongoose ODM
- **Vector DB**: Pinecone för semantic search
- **AI/ML**: Viking 7B via Ollama + LangChain
- **Auth**: JWT + bcrypt säkerhet
- **Deployment**: Vercel-ready konfiguration

### 📊 Estimerad Utvecklingstid:

**Total: 2-3 veckor** (beroende på erfarenhet och arbetstakt)

- Stage 1 (Step 1-4): ~1 vecka
- Stage 2 (Step 1-6): ~1-2 veckor
