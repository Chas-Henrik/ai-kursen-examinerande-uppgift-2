# AI Studie Mentor

En AI-driven webbapplikation för studiehjälp som låter användare ladda upp dokument och få svar på frågor på svenska.

## Teknisk Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Next.js API routes + Node.js
- **Databas:** MongoDB Atlas + Mongoose ODM
- **Vektordatabas:** Pinecone
- **AI Framework:** LangChain
- **LLM:** Viking 7B via Ollama
- **Autentisering:** JWT + bcrypt
- **UI:** Tailwind CSS + next-themes (mörk/ljus tema)

## Installation

1. Klona projektet:

```bash
git clone <repository-url>
cd ai-study-mentor
```

2. Installera dependencies:

```bash
npm install
```

3. Konfigurera miljövariabler:

```bash
cp .env.example .env.local
# Fyll i dina API-nycklar och databasanslutningar
```

4. Starta utvecklingsservern:

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

## Miljövariabler

Skapa en `.env.local` fil med följande variabler:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-study-mentor
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX_NAME=ai-study-mentor
OLLAMA_BASE_URL=http://localhost:11434
NODE_ENV=development
```

## Funktioner

- ✅ Användarregistrering och inloggning
- ✅ Dokumentuppladdning (PDF, TXT, webbsidor)
- ✅ AI-chatt på svenska baserat på uppladdade dokument
- ✅ Generering av studiefrågor
- ✅ Chatthistorik och sessionshantering
- ✅ Mörkt/ljust tema
- ✅ Responsiv design

## Utveckling

Projektet är strukturerat enligt Next.js 15 App Router med:

- `src/app/` - Sidor och API routes
- `src/components/` - React-komponenter
- `src/lib/` - Verktyg och konfiguration
- `src/models/` - Databasmodeller
- `src/types/` - TypeScript-typer

## Bidra

Detta projekt är utvecklat som del av en AI-kurs på svenska. Alla bidrag välkomnas!
