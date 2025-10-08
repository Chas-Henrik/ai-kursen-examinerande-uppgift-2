# AI Study Mentor - STAGE 1: Grundläggande Applikation

## Step 1: Projektsetup och grundstruktur

**Beskrivning**: Skapa projektstruktur, installera dependencies, konfigurera Tailwind och environment variables.

#### 📋 Checklista:

- [ ] **Skapa Next.js projekt**

  - [x] Kör `npx create-next-app@latest ai-study-mentor --typescript --tailwind --eslint --app`
  - [x] Navigera till projektmapp: `cd ai-study-mentor`

- [ ] **Installera ytterligare dependencies**

  - [ ] `npm install mongoose bcryptjs jsonwebtoken`
  - [ ] `npm install @types/bcryptjs @types/jsonwebtoken`
  - [ ] `npm install pdf-parse cheerio multer`
  - [ ] `npm install @pinecone-database/pinecone`
  - [ ] `npm install langchain @langchain/community @langchain/pinecone`
  - [ ] `npm install next-themes` (för light/dark mode)
  - [ ] `npm install axios dotenv`

- [ ] **Konfigurera miljövariabler (.env.local)**

  - [ ] Skapa `.env.local` fil
  - [ ] `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-study-mentor`
  - [ ] `JWT_SECRET=your-super-secret-jwt-key-here`
  - [ ] `PINECONE_API_KEY=your-pinecone-api-key`
  - [ ] `PINECONE_ENVIRONMENT=your-pinecone-environment`
  - [ ] `OLLAMA_BASE_URL=http://localhost:11434`
  - [ ] `NEXTAUTH_SECRET=your-nextauth-secret`

- [ ] **Skapa mappstruktur**

  ```
  src/
  ├── app/
  │   ├── api/
  │   │   ├── auth/
  │   │   ├── upload/
  │   │   └── chat/
  │   ├── globals.css
  │   ├── layout.tsx
  │   └── page.tsx
  ├── components/
  │   ├── ui/
  │   ├── layout/
  │   ├── auth/
  │   └── chat/
  ├── lib/
  │   ├── mongodb.ts
  │   ├── jwt.ts
  │   └── utils.ts
  ├── models/
  │   ├── User.ts
  │   └── Document.ts
  └── types/
      └── index.ts
  ```

- [ ] **Konfigurera Tailwind CSS**

  - [ ] Uppdatera `tailwind.config.js`:

  ```javascript
  module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          primary: "#10A37F",
          background: {
            light: "#FFFFFF",
            dark: "#1A1A1A",
          },
          surface: {
            light: "#F7F8F8",
            dark: "#2D2D2D",
          },
        },
      },
    },
  };
  ```

- [ ] **Skapa grundläggande README.md**
  - [ ] Projektbeskrivning på svenska
  - [ ] Installationsinstruktioner
  - [ ] Teknikstack (Next.js, TypeScript, MongoDB, Pinecone, Viking 7B)
  - [ ] Utvecklingsmiljö setup

#### ✅ Checkpoint:

Kör `npm run dev` och verifiera att projektet startar utan fel på http://localhost:3000

---

## Step 2: UI Layout med svenska text + light/dark mode toggle

**Beskrivning**: Skapa grundläggande layout (header, sidebar, chat area) med svenska text och dark mode toggle.

#### 📋 Checklista:

- [ ] **Implementera ThemeProvider**

  - [ ] Installera `next-themes` package
  - [ ] Skapa `src/components/providers/ThemeProvider.tsx`
  - [ ] Lägg till ThemeProvider i `app/layout.tsx`
  - [ ] Konfigurera för 'light' och 'dark' modes

- [ ] **Skapa Header komponent**

  - [ ] `src/components/layout/Header.tsx`
  - [ ] Logo och titel "AI Studie Mentor"
  - [ ] Dark/Light mode toggle knapp (🌙/☀️)
  - [ ] Auth knappar: "Registrera användare", "Logga in", "Logga ut"
  - [ ] Sticky positioning med Tailwind

- [ ] **Skapa Sidebar komponent**

  - [ ] `src/components/layout/Sidebar.tsx`
  - [ ] Rubrik "Historik"
  - [ ] Knapp "Ny Konversation"
  - [ ] Lista för tidigare chat-sessioner
  - [ ] Responsiv: dölj/visa på mobil

- [ ] **Skapa MainContent area**

  - [ ] `src/components/layout/MainContent.tsx`
  - [ ] Chat meddelande-area (scrollbar)
  - [ ] Input-fält med placeholder "Ställ en fråga..."
  - [ ] "Skicka" knapp
  - [ ] "Ladda upp dokument" område

- [ ] **Färgtema enligt specifikation**

  - [ ] Primary Green: `#10A37F`
  - [ ] Light mode: Background `#FFFFFF`, Surface `#F7F8F8`
  - [ ] Dark mode: Background `#1A1A1A`, Surface `#2D2D2D`
  - [ ] Text färger för light/dark modes

- [ ] **Svenska UI-texter**
  - [ ] Alla knappar, labels och meddelanden på svenska
  - [ ] "Ladda upp dokument", "Ställ en fråga", "Skicka", "Historik"
  - [ ] "Registrera användare", "Logga in", "Logga ut"

#### ✅ Checkpoint:

UI layout fungerar, dark mode toggle fungerar, alla texter på svenska

---

## Step 3: MongoDB Atlas + Mongoose schemas för users och sessions

**Beskrivning**: Koppla applikationen till MongoDB Atlas och skapa datamodeller för användare och chattsessioner.

#### 📋 Checklista:

- [ ] **MongoDB Atlas Setup**

  - [ ] Skapa MongoDB Atlas konto (gratis tier)
  - [ ] Skapa nytt cluster (M0 Sandbox)
  - [ ] Skapa databas-användare med lösenord
  - [ ] Lägg till IP-adress i Network Access (0.0.0.0/0 för dev)
  - [ ] Kopiera connection string till `.env.local`

- [ ] **Database Connection Setup**

  - [ ] Skapa `src/lib/mongodb.ts`
  - [ ] Mongoose connection med connection pooling
  - [ ] Error handling och retry logic
  - [ ] Export av `connectDB()` funktion

- [ ] **User Schema och Model**

  - [ ] Skapa `src/models/User.ts`
  - [ ] Schema fält: `name`, `email`, `password`, `createdAt`, `updatedAt`
  - [ ] Email validation och unique index
  - [ ] Pre-save middleware för password hashing med bcrypt
  - [ ] TypeScript interface för User type

- [ ] **ChatSession Schema och Model**

  - [ ] Skapa `src/models/ChatSession.ts`
  - [ ] Schema fält: `userId`, `title`, `messages[]`, `documentId`, `createdAt`
  - [ ] Message sub-schema: `role` ('user'|'assistant'), `content`, `timestamp`
  - [ ] Populate methods för user och document references

- [ ] **Document Schema och Model**
  - [ ] Skapa `src/models/Document.ts`
  - [ ] Schema fält: `userId`, `filename`, `originalText`, `chunks[]`, `vectorIds[]`
  - [ ] Metadata: `fileType`, `fileSize`, `uploadDate`, `processed`
  - [ ] Indexing för snabba sökningar

#### ✅ Checkpoint:

MongoDB Atlas anslutning fungerar, kan skapa/läsa dokument via Mongoose schemas

---

## Step 4: Autentisering (JWT) + test login/logout flow

**Beskrivning**: Implementera komplett autentiseringssystem med registrering, inloggning och session-hantering.

#### 📋 Checklista:

- [ ] **JWT Utilities Setup**

  - [ ] Skapa `src/lib/jwt.ts`
  - [ ] `generateToken(userId)` funktion
  - [ ] `verifyToken(token)` funktion
  - [ ] `getTokenFromRequest()` helper
  - [ ] Token expiration (7 dagar)

- [ ] **API Routes för Authentication**

  - [ ] `src/app/api/auth/register/route.ts`

    - [ ] POST: Validera `name`, `email`, `password`
    - [ ] Kontrollera om email redan finns
    - [ ] Hasha lösenord med bcrypt
    - [ ] Skapa user i MongoDB
    - [ ] Returnera JWT token + user info

  - [ ] `src/app/api/auth/login/route.ts`

    - [ ] POST: Validera `email` och `password`
    - [ ] Hitta user i databas
    - [ ] Jämför lösenord med bcrypt.compare()
    - [ ] Returnera JWT token + user info

  - [ ] `src/app/api/auth/me/route.ts`
    - [ ] GET: Verifiera JWT från header
    - [ ] Returnera current user info
    - [ ] Protected route middleware

- [ ] **Auth Context & State Management**

  - [ ] Skapa `src/context/AuthContext.tsx`
  - [ ] `AuthProvider` med React Context
  - [ ] State: `user`, `loading`, `isAuthenticated`
  - [ ] Functions: `login()`, `logout()`, `register()`
  - [ ] Persistent login med localStorage

- [ ] **Auth UI Komponenter**

  - [ ] `src/components/auth/LoginForm.tsx`

    - [ ] Form med "E-post" och "Lösenord" (svenska)
    - [ ] Submit till `/api/auth/login`
    - [ ] Error handling med svenska meddelanden
    - [ ] "Logga in" knapp

  - [ ] `src/components/auth/RegisterForm.tsx`
    - [ ] Form: "Namn", "E-post", "Lösenord", "Bekräfta lösenord"
    - [ ] Client-side validation
    - [ ] Submit till `/api/auth/register`
    - [ ] "Registrera användare" knapp

- [ ] **Protected Routes & Middleware**

  - [ ] Auth middleware för API routes
  - [ ] Client-side route protection
  - [ ] Redirect till login för icke-autentiserade

- [ ] **Integration med Header**
  - [ ] Visa user namn när inloggad
  - [ ] "Logga ut" knapp som clearar token
  - [ ] Toggle mellan "Logga in"/"Registrera" och "Logga ut"

#### ✅ Checkpoint:

Kan registrera ny användare, logga in/ut, sessions sparas mellan page refreshes

---

## STAGE 2: Avancerad Funktionalitet

### Step 1: Filuppladdning och textextrahering

**Beskrivning**: Implementera uppladdning av PDF/text/URL och extrahering av innehåll.

#### 📋 Checklista:

- [ ] **Filuppladdning UI**

  - [ ] `src/components/FileUpload/UploadArea.tsx`
    - [ ] Drag & drop område med svenska text
    - [ ] Stöd för PDF, TXT filer och URL-länkar
    - [ ] Progress bar för uppladdning
    - [ ] Filtyp och storlek validering

- [ ] **API Route för filuppladdning**

  - [ ] `src/app/api/upload/route.ts`
    - [ ] Hantera multipart/form-data
    - [ ] Validera filtyp och storlek
    - [ ] Lagra fil temporärt för bearbetning

- [ ] **Text Extraction Logic**

  - [ ] `src/lib/textExtraction.ts`
    - [ ] PDF parsing med `pdf-parse`
    - [ ] URL content fetching och parsing
    - [ ] Text cleaning och normalisering
    - [ ] Chunking av text i segment (500 tokens)

- [ ] **Document Processing Workflow**
  - [ ] Extrahera text från uppladdad fil
  - [ ] Dela upp i chunks
  - [ ] Rensa och normalisera text
  - [ ] Spara i Document schema

#### ✅ Checkpoint:

Filer laddas upp korrekt och text extraheras utan fel

---

### Step 2: LangChain + Ollama + Pinecone integration

**Beskrivning**: Implementera embeddings, vector storage och semantisk sökning.

#### 📋 Checklista:

- [ ] **Pinecone Setup**

  - [ ] Skapa Pinecone index
  - [ ] Konfigurera dimensions och metrics
  - [ ] Testa connection från applikationen

- [ ] **Embeddings med LangChain**

  - [ ] `src/lib/embeddings.ts`
    - [ ] Konfigurera embedding model
    - [ ] Funktion för att skapa embeddings från text chunks
    - [ ] Batch processing för stora dokument

- [ ] **Vector Storage**

  - [ ] `src/lib/vectorStore.ts`
    - [ ] Lagra embeddings i Pinecone
    - [ ] Metadata för chunks (document ID, chunk index)
    - [ ] Bulk insert funktionalitet

- [ ] **Semantic Search**

  - [ ] `src/lib/retrieval.ts`
    - [ ] Skapa query embeddings
    - [ ] Semantisk sökning i Pinecone
    - [ ] Returnera relevanta text chunks
    - [ ] Ranking och relevans scoring

- [ ] **Ollama Integration**
  - [ ] `src/lib/ollama.ts`
    - [ ] Konfigurera Viking 7B model
    - [ ] API client för Ollama
    - [ ] Error handling och retry logic

#### ✅ Checkpoint:

Embeddings skapas och lagras, semantisk sökning returnerar relevanta resultat

---

### Step 3: Chat API med Viking 7B

**Beskrivning**: Skapa API endpoint för chatting som använder retrieved context.

#### 📋 Checklista:

- [ ] **Chat API Route**

  - [ ] `src/app/api/chat/route.ts`
    - [ ] Ta emot användarfråga
    - [ ] Utför semantisk sökning för relevanta chunks
    - [ ] Skapa prompt med context och fråga
    - [ ] Anropa Viking 7B via Ollama
    - [ ] Returnera svar på svenska

- [ ] **Prompt Engineering**

  - [ ] `src/lib/prompts.ts`
    - [ ] System prompt för svenska svar (max 3-4 meningar)
    - [ ] Context injection template
    - [ ] Fallback meddelanden för irrelevanta frågor

- [ ] **Chat UI Components**

  - [ ] `src/components/Chat/ChatInterface.tsx`

    - [ ] Meddelande-lista med user/assistant bubblor
    - [ ] Input-fält med "Skicka" knapp
    - [ ] Loading states under AI-processing

  - [ ] `src/components/Chat/MessageBubble.tsx`
    - [ ] Olika styling för user vs assistant
    - [ ] Timestamp och markdown support
    - [ ] Copy-to-clipboard funktionalitet

- [ ] **Real-time Updates**
  - [ ] Streaming responses (optional)
  - [ ] Loading indicators
  - [ ] Error handling med svenska meddelanden

#### ✅ Checkpoint:

Chat fungerar med korta svenska svar baserat på uppladdade dokument

---

### Step 4: Studiefrågor Generator

**Beskrivning**: AI skapar automatiska frågor baserat på det uppladdade materialet.

#### 📋 Checklista:

- [ ] **Question Generation API**

  - [ ] `src/app/api/generate-questions/route.ts`
    - [ ] Analysera document chunks
    - [ ] Generera relevanta studiefrågor på svenska
    - [ ] Olika typer: faktafrågor, förståelsefrågor, analysfrågor

- [ ] **Question Types & Templates**

  - [ ] `src/lib/questionGenerator.ts`
    - [ ] Template för olika frågetyper
    - [ ] Svårighetsgrader (lätt, medel, svår)
    - [ ] Svenska frågeformulering

- [ ] **Questions UI**

  - [ ] `src/components/StudyQuestions/QuestionsList.tsx`

    - [ ] Lista över genererade frågor
    - [ ] "Generera nya frågor" knapp
    - [ ] Filtrera efter svårighetsgrad

  - [ ] `src/components/StudyQuestions/QuestionCard.tsx`
    - [ ] Visa fråga och potential svar
    - [ ] "Visa svar" toggle
    - [ ] Markera som "läst" eller "svår"

#### ✅ Checkpoint:

AI genererar relevanta svenska studiefrågor från dokument

---

### Step 5: Historik och session persistence

**Beskrivning**: Spara och visa tidigare chattsessioner och uppladdade dokument.

#### 📋 Checklista:

- [ ] **Session Management**

  - [ ] Skapa ny session vid varje dokument-uppladdning
  - [ ] Spara alla meddelanden i session
  - [ ] Automatisk titel-generering för sessioner

- [ ] **History API Routes**

  - [ ] `src/app/api/sessions/route.ts` (lista sessioner)
  - [ ] `src/app/api/sessions/[id]/route.ts` (hämta specifik session)
  - [ ] `src/app/api/sessions/[id]/messages/route.ts` (meddelanden)

- [ ] **History UI Components**

  - [ ] `src/components/History/SessionsList.tsx`

    - [ ] Lista över tidigare sessioner i sidebar
    - [ ] Session-titlar och datum
    - [ ] "Radera session" funktionalitet

  - [ ] `src/components/History/SessionView.tsx`
    - [ ] Visa complete chat history
    - [ ] Återuppta conversation i befintlig session
    - [ ] Export/backup funktionalitet

- [ ] **Data Management**
  - [ ] Pagination för stora historik
  - [ ] Search/filter i historik
  - [ ] Cleanup av gamla sessioner

#### ✅ Checkpoint:

Användare kan se och återuppta tidigare chattsessioner

---

### Step 6: UI-polish, testing och deployment

**Beskrivning**: Finputsa UI, lägg till tester och förbered för deployment.

#### 📋 Checklista:

- [ ] **UI/UX Förbättringar**

  - [ ] Förbättra responsive design
  - [ ] Loading skeletons och smooth transitions
  - [ ] Error boundaries och 404 sidor
  - [ ] Accessibility (a11y) förbättringar

- [ ] **Performance Optimering**

  - [ ] Lazy loading för komponenter
  - [ ] Image optimization
  - [ ] Bundle size analysis och optimering
  - [ ] Caching strategies

- [ ] **Testing**

  - [ ] Unit tests för viktiga funktioner
  - [ ] Integration tests för API routes
  - [ ] E2E tests för kritiska user flows
  - [ ] Test coverage rapporter

- [ ] **Säkerhet**

  - [ ] Input validation och sanitization
  - [ ] Rate limiting för API routes
  - [ ] CORS konfiguration
  - [ ] Environment variables säkerhet

- [ ] **Deployment Förberedelser**

  - [ ] Docker konfiguration (optional)
  - [ ] Vercel/Netlify deployment setup
  - [ ] Environment variables för production
  - [ ] Database migration scripts

- [ ] **Dokumentation**
  - [ ] API dokumentation
  - [ ] Deployment guide
  - [ ] User manual på svenska
  - [ ] Troubleshooting guide

#### ✅ Checkpoint:

Applikationen är produktionsklar med komplett funktionalitet

---

## 🎯 Slutmål

En fullt fungerande AI Study Mentor applikation med:

- ✅ Filuppladdning (PDF, text, URL)
- ✅ Swedish chat interface med Viking 7B
- ✅ Semantisk sökning med LangChain + Pinecone
- ✅ Användarautentisering och historik
- ✅ Automatisk studiefrågor-generering
- ✅ Responsiv design med dark/light mode
- ✅ MongoDB Atlas integration
- ✅ Production-ready deployment

**Total estimerad tid**: 2-3 veckor beroende på erfarenhet och arbetstakt.
