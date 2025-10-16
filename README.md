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

#### 🤖 AI Framework & Integration

- **LangChain** - Framework för AI-applikationer
  - `RecursiveCharacterTextSplitter` - Intelligent textuppdelning (500 tecken chunks, 100 överlapp)
  - `HuggingFaceTransformersEmbeddings` - Embedding generation med Hugging Face
  - `PineconeStore` - Vector database integration
  - `Ollama` wrapper - LLM integration för chat och generation
  - Structured prompts för konsistenta svenska svar

#### 🧠 AI Modeller & Tjänster

- **Ollama (Lokalt)** - AI-modellserver på localhost:11434

  - `llama3.2:1b` (1.3GB) - Primary chat model för konversation
  - `gemma3:4b` - Question generation och avancerad textbearbetning
  - `nomic-embed-text:latest` (274MB) - Embedding generation (LangChain integration)

- **HuggingFace Transformers** - Embedding modeller
  - `sentence-transformers/all-MiniLM-L6-v2` - 384-dimensionella embeddings
  - Används för semantisk sökning och dokumentjämförelse

#### 🗄️ Vector Database & Storage

- **Pinecone** - Cloud vektordatabas för RAG
  - Serverless deployment i AWS us-east-1
  - 384-dimensionella vektorer (HuggingFace kompatibel)
  - Cosine similarity för semantisk matching
  - User-specific indexes och namespace separation
  - Metadata storage för chunk-text och document mapping

### Dokumentbehandling

- **pdf-parse** - PDF textextraktion
- **Custom chunking** - Intelligent textuppdelning (max 100 chunks per dokument)
- **RAG (Retrieval Augmented Generation)** - Kontext-medveten AI

## 🚀 Installation & Setup

### Systemkrav

- **Node.js 18+** - JavaScript runtime
- **MongoDB Atlas** - Databas (cloud eller lokal)
- **Ollama** - Lokal AI-modellserver
- **Pinecone Account** - Vektordatabas (gratis tier tillgänglig)

#### 🖥️ Hårdvarukrav för AI-modeller

- **Minst 8GB RAM** - För alla AI-modeller samtidigt
- **6GB Disk** - För Ollama-modeller (~6GB totalt)
- **100MB Extra** - För HuggingFace cache
- **CPU:** Modern processor (Apple Silicon/AMD64)
- **Internet:** Stabil anslutning för första nedladdning

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

# AI Services
OLLAMA_BASE_URL=http://localhost:11434

# AI Models (automatisk konfiguration i kod)
# PRIMARY_CHAT_MODEL=llama3.2:1b
# QUESTION_MODEL=gemma3:4b
# EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### 3. AI-modeller (Ollama)

```bash
# Installera Ollama
# Windows: Ladda ner från https://ollama.ai
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.ai/install.sh | sh

# Starta Ollama service
ollama serve

# Ladda ner AI-modeller (totalt ~6GB)
ollama pull llama3.2:1b          # 1.3GB - Primary chat model
ollama pull gemma3:4b            # 4.9GB - Question generation
ollama pull nomic-embed-text     # 274MB - Embedding generation

# Verifiera att modellerna är installerade
ollama list
```

### 4. Embedding Modeller (HuggingFace)

```bash
# Modellerna laddas ner automatiskt vid första användning
# sentence-transformers/all-MiniLM-L6-v2 (~90MB)
# Lagras lokalt i: ~/.cache/huggingface/transformers/
```

### 5. Vektordatabas (Pinecone)

1. Skapa konto på [pinecone.io](https://pinecone.io)
2. Skapa API-nyckel i Pinecone dashboard
3. Index skapas automatiskt per användare med följande spec:
   - **Dimensions:** `384` (HuggingFace all-MiniLM-L6-v2 kompatibel)
   - **Metric:** `cosine`
   - **Cloud:** `aws`
   - **Region:** `us-east-1`
   - **Type:** `serverless` (gratis tier)

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
| � **Chat History**          | ✅     | Sessions visas i sidebar, cookie-baserad auth     |
| �🛡️ **Felhantering**        | ✅     | ErrorBoundary komponenter och loading states      |
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
│   │   ├── langchain.ts         # LangChain service för AI operations ✅
│   │   ├── ollama.ts            # Ollama wrapper service ✅
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

#### LangChain Implementation

**Text Processing Pipeline:**

1. **RecursiveCharacterTextSplitter** - Delar upp dokument i 1000-tecken chunks med 200-tecken överlapp
2. **OllamaEmbeddings** - Konverterar text till 768-dimensionella vektorer med `nomic-embed-text`
3. **PineconeStore** - Lagrar och söker vektorer i namespace per användare
4. **Structured Prompts** - Genererar kontextuella svar på svenska

**Key Features:**

- Semantic chunking med flera separatorer (`\n\n`, `\n`, `. `, ` `)
- Error handling med detaljerad loggning
- Memory-efficient processing
- RAG (Retrieval-Augmented Generation) för precisare svar

#### 🔄 AI Processing Pipeline

**1. Dokumentbearbetning (Upload):**

```
PDF → pdf-ts → Text Extraction → RecursiveCharacterTextSplitter
→ Chunks (500 chars, 100 overlap) → HuggingFace Embeddings
→ Pinecone Vectors (384-dim) → User Index Storage
```

**2. Chat & RAG Pipeline:**

```
User Query → HuggingFace Embedding → Pinecone Similarity Search
→ Top-3 Relevant Chunks → Context Assembly → Ollama LLM (llama3.2:1b)
→ Swedish Response Generation → Streaming Response
```

**3. Question Generation:**

```
Document Text → Context Preparation → Ollama LLM (gemma3:4b)
→ JSON Question/Answer Pairs → MongoDB Storage → UI Display
```

#### 🎯 AI Performance Specifications

| Component           | Model/Service       | Size  | Dimensions | Purpose             |
| ------------------- | ------------------- | ----- | ---------- | ------------------- |
| **Chat LLM**        | `llama3.2:1b`       | 1.3GB | N/A        | Conversational AI   |
| **Question LLM**    | `gemma3:4b`         | 4.9GB | N/A        | Question generation |
| **Embeddings**      | `all-MiniLM-L6-v2`  | 90MB  | 384-dim    | Semantic search     |
| **Vector DB**       | Pinecone Serverless | Cloud | 384-dim    | RAG retrieval       |
| **Text Processing** | LangChain Splitters | N/A   | N/A        | Chunk management    |

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

### 🔧 AI Felsökning

#### Ollama Problem

```bash
# Kontrollera att Ollama kör
curl http://localhost:11434/api/tags

# Starta om Ollama service
ollama serve

# Testa modeller individuellt
ollama run llama3.2:1b "Hej på svenska"
ollama run gemma3:4b "Generate a test question"
```

#### Pinecone Problem

- **Dimension Mismatch**: Kontrollera 384-dimensioner (HuggingFace)
- **API Key**: Verifiera giltighet i Pinecone dashboard
- **Index Creation**: Indexes skapas automatiskt per användare
- **Namespace**: Separata namespaces per dokument

#### Embedding Problem

- **HuggingFace Cache**: `~/.cache/huggingface/transformers/`
- **Model Download**: Första gången tar tid (~90MB)
- **Memory**: sentence-transformers kräver ~500MB RAM

#### Allmän AI Felsökning

- **Memory Issues**: Använd llama3.2:1b (1.3GB) för mindre RAM-användning
- **Timeout**: Stora PDF:er kan ta upp till 2 minuter
- **Connection**: Alla AI-tjänster kräver stabil internetanslutning första gången

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
