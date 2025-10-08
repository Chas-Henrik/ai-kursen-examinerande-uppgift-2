# AI Study Mentor - Auto-Implementation Instructions

## 🎯 SYSTEM ROLE
You are an expert full-stack developer AI tasked with implementing a complete, production-ready web application. You will write ALL code, create ALL files, and ensure everything works perfectly.

## 📝 PROJECT SPECIFICATION

**Application Name:** AI Study Mentor  
**Purpose:** Swedish AI chat interface for studying uploaded documents

**Core User Flow:**
1. User registers/logs in
2. User uploads PDF, text file, or webpage URL
3. System extracts text, creates embeddings, stores in vector database
4. User asks questions in Swedish about the document
5. AI responds in Swedish (max 3-4 sentences) based ONLY on document content
6. AI can generate Swedish study questions from the document

## 🛠️ MANDATORY TECHNICAL STACK

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Next.js API routes + Node.js
- **Database:** MongoDB Atlas + Mongoose ODM
- **Vector Database:** Pinecone
- **AI Framework:** LangChain (text splitting, embeddings, retrieval, prompts)
- **LLM:** Viking 7B via Ollama (local installation)
- **Embeddings:** nomic-embed-text via Ollama
- **Authentication:** JWT + bcrypt
- **UI Framework:** Tailwind CSS + next-themes (dark/light mode)
- **Language:** All UI text in Swedish, All AI responses in Swedish

## 🚨 CRITICAL IMPLEMENTATION RULES

### **STAGE EXECUTION ORDER (ABSOLUTE REQUIREMENT)**
1. **STAGE 1 FIRST:** Complete `plan-1.md` entirely (Foundation)
2. **STAGE 2 SECOND:** Complete `plan-2.md` entirely (AI Features)
3. **NO EXCEPTIONS:** Do not start Stage 2 until Stage 1 is 100% functional

### **CODE QUALITY REQUIREMENTS**
- ✅ Write complete, production-ready code (no placeholders)
- ✅ Create ALL files with full implementations
- ✅ Use exact file paths and folder structures as specified
- ✅ Include proper TypeScript types and error handling
- ✅ Add Swedish error messages and UI text throughout
- ✅ Implement responsive design with Tailwind classes
- ✅ Test every feature after implementation

### **AI/LLM BEHAVIOR REQUIREMENTS**
- ✅ Viking 7B MUST respond only in Swedish
- ✅ Maximum 3-4 sentences per response
- ✅ Responses ONLY based on uploaded document content
- ✅ Exact fallback: "Den här informationen finns inte i det uppladdade materialet."
- ✅ Study questions generated in Swedish from document content

## 📋 IMPLEMENTATION PHASES

### **🏗️ PHASE 1: FOUNDATION (plan-1.md)**
**Deliverables:** Working Next.js app with auth and database

**Step 1:** Project setup, dependencies, environment configuration
**Step 2:** UI layout with Swedish text and dark/light mode
**Step 3:** MongoDB Atlas connection and Mongoose schemas
**Step 4:** JWT authentication (register/login/logout/protected routes)

**Phase 1 Success Test:**
```bash
npm run dev  # Must start without errors
# User can register, login, logout successfully
# UI shows Swedish text with working theme toggle
# MongoDB connects and stores user data
```

### **🤖 PHASE 2: AI FEATURES (plan-2.md)**
**Deliverables:** Full AI chat system with document processing

**Step 1:** File upload (PDF/TXT/URL) with text extraction
**Step 2:** LangChain + Pinecone + Ollama embeddings pipeline
**Step 3:** Chat API with Viking 7B Swedish responses
**Step 4:** Swedish study question generator
**Step 5:** User session history and persistence
**Step 6:** Production polish and deployment preparation

**Phase 2 Success Test:**
```bash
# User can upload files and chat receives Swedish responses
# Questions generate automatically in Swedish
# Chat history persists across sessions
# All features work end-to-end
```

## 🔧 ENVIRONMENT SETUP REQUIREMENTS

Create `.env.local` with these exact variables:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-study-mentor
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment  
PINECONE_INDEX_NAME=ai-study-mentor
OLLAMA_BASE_URL=http://localhost:11434
NODE_ENV=development
```

## 📁 REQUIRED PROJECT STRUCTURE

```
ai-study-mentor/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.js
├── package.json
├── README.md
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── api/
    │       ├── auth/
    │       ├── upload/
    │       ├── chat/
    │       └── sessions/
    ├── components/
    │   ├── layout/
    │   ├── auth/
    │   ├── upload/
    │   ├── chat/
    │   └── ui/
    ├── lib/
    │   ├── mongodb.ts
    │   ├── jwt.ts
    │   ├── embeddings.ts
    │   ├── vectorStore.ts
    │   └── textExtraction.ts
    ├── models/
    │   ├── User.ts
    │   ├── Document.ts
    │   └── ChatSession.ts
    └── types/
        └── index.ts
```

## ❌ WHAT NOT TO DO (CRITICAL)

- ❌ **NO partial implementations** - every feature must be complete
- ❌ **NO placeholder code** - write full, working implementations
- ❌ **NO English UI text** - everything must be in Swedish
- ❌ **NO skipping checkpoints** - test each step thoroughly
- ❌ **NO mixed Swedish/English** - consistency is crucial
- ❌ **NO proceeding without testing** - verify each step works
- ❌ **NO ignoring error handling** - implement proper error states

## ✅ COMPLETION CRITERIA

The implementation is successful when:

1. **Authentication works:** Register → Login → Protected routes
2. **File upload works:** PDF/TXT/URL → Text extraction → Storage
3. **Embeddings work:** Text → Chunks → Vectors → Pinecone storage
4. **Chat works:** User question → Semantic search → Viking 7B → Swedish response
5. **Questions work:** Document → AI analysis → Swedish study questions
6. **History works:** Sessions save → User can view/resume previous chats
7. **UI works:** Swedish text throughout, dark/light mode, responsive
8. **Production ready:** No errors, proper error handling, deployable

## 🚀 EXECUTION START

**Begin now with:** Read `plan-1.md` completely, then implement Step 1 (Project Setup)

Remember: You are building a complete, production-quality application. Every line of code matters. Every Swedish translation matters. Every test checkpoint matters. Take your time and build it right.