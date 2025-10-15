# AI Study Mentor - Examinerande Uppgift 2

## 📋 Projektöversikt

**AI Study Mentor** är en fullstack-applikation som kombinerar modern webbutveckling med AI för att skapa en intelligent studieguide. Systemet låter användare ladda upp dokument och sedan ställa frågor om innehållet, med AI-genererade svar baserade på semantisk sökning.

## 🏗️ Arkitektur & Teknologier

### Frontend

- **Next.js 15.5.4** - React-baserat fullstack framework med Turbopack
- **TypeScript** - Typsäker utveckling
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Tillståndshantering och API-integration

### Backend & API

- **Next.js API Routes** - Serverless funktioner
- **MongoDB** - Dokumentdatabas med Mongoose ODM
- **JWT Authentication** - Säker autentisering med httpOnly cookies
- **Multer** - Filuppladdningshantering

### AI & Machine Learning

- **Ollama** - Lokal AI-modellserver
  - `llama3.2:1b` (1.3GB) - Text generation och chat
  - `nomic-embed-text:latest` (274MB) - Embedding generation
- **Pinecone** - Vektordatabas för semantisk sökning
  - Serverless deployment i us-east-1
  - 1536-dimensionella vektorer
  - Namespace per användare för dataseparation

### Dokumentbehandling

- **pdf-parse** - PDF textextraktion
- **Custom chunking** - Intelligent textuppdelning (max 100 chunks per dokument)
- **RAG (Retrieval Augmented Generation)** - Kontext-medveten AI

## 🚀 Installation & Setup

### Systemkrav

- **Node.js 18+** - JavaScript runtime
- **MongoDB Atlas** - Databas (cloud eller lokal)
- **Ollama** - Lokal AI-modellserver
- **Pinecone** - Vektordatabas (gratis tier tillgänglig)
- **Minst 4GB RAM** - För AI-modeller

### 1. Grundinstallation

```bash
# Klona projektet
git clone [repository-url]
cd ai-study-mentor

# Installera beroenden
npm install
```

### 2. Miljövariabler (.env.local)

```env
# MongoDB
MONGODB_URI=mongodb+srv://[användare]:[lösenord]@cluster.mongodb.net/ai-study-mentor

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=ai-study-mentor

# JWT
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
```

### 3. AI-modeller (Ollama)

```bash
# Installera Ollama
# Windows: Ladda ner från https://ollama.ai
# macOS: brew install ollama

# Starta Ollama service
ollama serve

# Ladda ner optimerade modeller
ollama pull llama3.2:1b          # 1.3GB - Chat generation
ollama pull nomic-embed-text     # 274MB - Embeddings
```

### 4. Vektordatabas (Pinecone)

1. Skapa konto på [pinecone.io](https://pinecone.io)
2. Skapa nytt index:
   - **Name:** `ai-study-mentor`
   - **Dimensions:** `768`
   - **Metric:** `cosine`
   - **Environment:** `gcp-starter` (gratis)

### 5. Starta applikationen

```bash
# Utvecklingsläge med Turbopack
npm run dev

# Produktion
npm run build
npm start
```

Applikationen körs på **[http://localhost:3000](http://localhost:3000)**

## ✨ Funktioner & Status

### ✅ KOMPLETT - Implementerade Funktioner

| Funktion                    | Status | Beskrivning                                       |
| --------------------------- | ------ | ------------------------------------------------- |
| 🔐 **Autentisering**        | ✅     | JWT med httpOnly cookies, bcrypt-hashning         |
| 🎨 **UI/UX**                | ✅     | Responsive design, mörk/ljus tema, Tailwind CSS   |
| 📄 **Filuppladdning**       | ✅     | PDF-parsing, validering, felhantering             |
| 🤖 **AI Chat**              | ✅     | Integrerat i huvudgränssnittet med källreferenser |
| 🔍 **Semantisk Sökning**    | ✅     | Pinecone vektorsökning med användarnamespaces     |
| 📊 **Embedding Generation** | ✅     | Nomic-embed-text för dokumentvektorisering        |
| 🛡️ **Säkerhet**             | ✅     | CORS, autentisering på alla endpoints             |
| � **Dokumenthantering**     | ✅     | UI för att visa/ta bort uppladdade dokument       |
| ❓ **AI Studiefrågor**      | ✅     | Automatisk generering av flervalsfrågor från text |
| 📚 **Studiesession**        | ✅     | Interaktiv frågespel med poäng och förklaringar   |
| 🔍 **Sessionsökning**       | ✅     | Sök och filtrera tidigare studiesessioner         |
| � **Chat History**         | ✅     | Sessions visas i sidebar, cookie-baserad auth     |
| �🛡️ **Felhantering**         | ✅     | ErrorBoundary komponenter och loading states      |
| 🎯 **Byggoptimering**       | ✅     | TypeScript-fel fixade, debug-filer rensade        |

### 🎉 NYLIGEN TILLAGDA FUNKTIONER

| Funktion                 | Beskrivning                                      |
| ------------------------ | ------------------------------------------------ |
| **StudySession.tsx**     | Komplett studiequiz med olika frågetyper         |
| **DocumentManager.tsx**  | Översikt över dokument med sessionslansering     |
| **questionGenerator.ts** | AI-driven generering av studiefrågor på svenska  |
| **Sessions API**         | RESTful API för sessionshantering med sökning    |
| **Error Boundaries**     | Robust felhantering genom hela applikationen     |
| **Loading Skeletons**    | Förbättrad användarupplevelse med loading states |

### 🔧 TEKNISKA PRESTATIONER

#### Lösta Utmaningar

1. **PDF-parse Import Problem** - Löst med dynamiska imports
2. **Dubbel Password Hashing** - Fixat i autentiserings-API
3. **Memory Constraints** - Optimerat med llama3.2:1b (1.3GB vs 6GB)
4. **Token Inconsistency** - Standardiserat till httpOnly cookies
5. **MongoDB Schema Issues** - Uppdaterad filtypsvalidering
6. **Chat History 401 Errors** - SessionHistory nu använder cookies istället för headers

#### Performance Optimeringar

- **Chunking Limit:** Max 100 chunks per dokument
- **PDF Timeout:** 2 minuter för stora filer
- **Memory Management:** Optimerade AI-modeller
- **Error Handling:** Omfattande loggning och felhantering

## 📁 Detaljerad Projektstruktur

```
ai-study-mentor/
├── 📁 public/                    # Statiska resurser
│   ├── file.svg, globe.svg      # UI-ikoner
│   └── next.svg, vercel.svg     # Brand assets
├── 📁 src/
│   ├── 📁 app/                   # Next.js App Router
│   │   ├── 📁 api/               # Server-side API endpoints
│   │   │   ├── auth/            # JWT autentisering
│   │   │   │   ├── login/       # Inloggning endpoint
│   │   │   │   ├── logout/      # Utloggning endpoint
│   │   │   │   └── register/    # Registrering endpoint
│   │   │   ├── chat/            # AI chat endpoint ✅
│   │   │   │   └── route.ts     # RAG-baserad chat API
│   │   │   └── documents/       # Filuppladdning ✅
│   │   │       └── upload/      # PDF upload & processing
│   │   ├── auth/                # Autentiseringssidor
│   │   │   ├── login/          # Inloggningssida
│   │   │   └── register/       # Registreringssida
│   │   ├── favicon.ico          # Site favicon
│   │   ├── globals.css          # Global stilar + Tailwind
│   │   ├── layout.tsx           # Root layout med providers
│   │   └── page.tsx             # Hemsida med chat integration
│   ├── 📁 components/            # React komponenter
│   │   ├── auth/                # Autentisering
│   │   │   ├── AuthProvider.tsx # Auth context ✅
│   │   │   ├── LoginForm.tsx    # Inloggningsformulär
│   │   │   └── RegisterForm.tsx # Registreringsformulär
│   │   ├── layout/              # Layout komponenter
│   │   │   └── MainContent.tsx  # Huvudgränssnitt med AI chat ✅
│   │   └── ui/                  # UI komponenter
│   │       ├── FileUpload.tsx   # Filuppladdning ✅
│   │       └── ThemeProvider.tsx # Tema hantering
│   ├── 📁 lib/                   # Utilities & konfiguration
│   │   ├── auth.ts              # JWT hantering & middleware
│   │   ├── db.ts                # MongoDB anslutning ✅
│   │   ├── documentProcessor.ts  # PDF parsing & chunking ✅
│   │   ├── embeddings.ts        # Ollama integration ✅
│   │   └── pinecone.ts          # Vektordatabas client ✅
│   ├── 📁 models/                # MongoDB Mongoose schemas
│   │   ├── Document.ts          # Dokumentschema ✅
│   │   └── User.ts              # Användarschema ✅
│   └── 📁 types/                 # TypeScript definitioner
│       └── index.ts             # Gemensamma typer
├── .env.local                   # Miljövariabler (ej versionshanterat)
├── eslint.config.mjs            # ESLint konfiguration
├── next.config.ts               # Next.js konfiguration
├── package.json                 # Beroenden och scripts
├── postcss.config.mjs           # PostCSS för Tailwind
├── README.md                    # Detta dokument
└── tsconfig.json                # TypeScript konfiguration
```

## 🔧 Utvecklingsdetaljer

### API Endpoints

| Endpoint                | Metod | Syfte              | Auth |
| ----------------------- | ----- | ------------------ | ---- |
| `/api/auth/register`    | POST  | Skapa nytt konto   | ❌   |
| `/api/auth/login`       | POST  | Logga in användare | ❌   |
| `/api/auth/logout`      | POST  | Logga ut användare | ✅   |
| `/api/documents/upload` | POST  | Ladda upp PDF      | ✅   |
| `/api/chat`             | POST  | AI chat med RAG    | ✅   |
| `/api/sessions`         | GET   | Hämta chat history | ✅   |

### Tekniska Specifikationer

#### AI Pipeline

1. **Dokumentuppladdning** → PDF-parse extraktion
2. **Textchunking** → Max 100 chunks per dokument
3. **Embedding Generation** → Nomic-embed-text (768 dimensioner)
4. **Vektorlagring** → Pinecone med användarnamespace
5. **Semantisk Sökning** → Cosine similarity
6. **AI Generation** → llama3.2:1b med kontext

#### Säkerhetsimplementering

- **httpOnly Cookies** för JWT-lagring
- **CORS** konfiguration för säkra API-anrop
- **Bcrypt** för lösenordshashning
- **User Namespace** separation i Pinecone
- **Filtypsvalidering** för uppladdningar

## 🧪 Testing & Utveckling

### Lokalt Utvecklingsflöde

```bash
# Starta utvecklingsmiljö
npm run dev

# Kontrollera Ollama status
curl http://localhost:11434/api/tags

# Testa AI-modeller
ollama run llama3.2:1b "Hej, hur fungerar du?"
```

### Felsökning

- **Memory Issues**: Använd llama3.2:1b istället för större modeller
- **PDF Parse Errors**: Kontrollera att test-filer finns i temp-mappen
- **Auth Problems**: Verifiera JWT_SECRET och cookie-inställningar
- **Pinecone Errors**: Kontrollera index dimensioner (768 för nomic-embed-text)

## 🎯 Utvecklingshistorik

### Genomförda Milstolpar

- ✅ **STAGE 1**: Grundläggande Next.js setup med autentisering
- ✅ **STAGE 2**: Filuppladdning och PDF-processing
- ✅ **STAGE 3**: AI Chat interface med RAG-integration
- 🔄 **STAGE 4**: Dokumenthantering UI (pågående)

### Tekniska Prestationer

- **End-to-End Funktionalitet**: Fullständigt fungerande AI-assisterad chattbot
- **Performance Optimization**: Memory-optimerade AI-modeller för development
- **Security Implementation**: Säker autentisering och datahantering
- **Error Handling**: Omfattande felhantering och användarfeedback

---

## 📄 Licens & Bidrag

Detta projekt är utvecklat som del av **AI-kursen Examinerande Uppgift 2**.

### Bidrag

- Följ TypeScript best practices
- Använd Tailwind CSS för styling
- Implementera error handling
- Dokumentera nya funktioner
