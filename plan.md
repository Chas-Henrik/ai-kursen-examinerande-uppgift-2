# Plan för AI Study Mentor

## Mål

Bygga en enkel studie-mentor där användaren kan ladda upp kursmaterial (PDF) och ställa frågor i en chatt som besvaras av en LLM.

---

## Projektbeskrivning

AI Study Mentor är en webbaserad applikation som hjälper studenter att förstå och studera från sitt eget material.

### Grundläggande Funktioner

1. **Ladda upp material**:
   - PDF, textfiler eller URL-länkar.
   - Systemet extraherar eller hämtar text från materialet.
2. **Frågor och svar**:
   - Användaren ställer frågor om materialet.
   - AI svarar baserat på innehållet.
3. **Generera studiefrågor**:
   - AI skapar frågor baserat på det uppladdade materialet.

### Semantisk Sökning och Embeddings

- **Textdelning**: Dela upp dokument i mindre segment.
- **Embeddings**: Skapa vektorrepresentationer av segmenten och lagra i en vektordatabas.
- **Sökning**: Vid frågor hämtas relevanta segment via semantisk sökning och skickas till LLM.

---

## Språk

- **UI**: Svenska.
- **LLM**: Stöd för både svenska och engelska.

---

## Funktionalitet

### 1. Ladda upp PDF, text eller url länk

- UI-komponent för filuppladdning.
- Backend tar emot och bearbetar filen.

### 2. Extrahera Text

- Använd bibliotek som `pdf-parse` eller om det finns bättre alternativ som `pdf-lib`.
- Rensa metadata, sidnummer och irrelevanta tecken.

### 3. Chattgränssnitt

- Enkel chatt där användaren kan skriva frågor.
- Svar visas direkt under frågan.
- Default-svar för orelaterade frågor.

### 4. Anrop till LLM

- Skicka extraherad text som kontext tillsammans med användarens fråga.
- Returnera AI:s svar och visa i chatten.

### 5. Embeddings & Semantisk Sökning

- Dela upp text i segment (t.ex. 500 tokens).
- Skapa embeddings med OpenAI.
- Lagra embeddings i Pinecone.
- Vid frågor hämtas relevanta segment och skickas till LLM.

### 6. Autentisering

- Header-meny för registrering, inloggning och utloggning.

### 7. Historik

- Vänster sidebar med sparad historik av frågor och svar för inloggade användare.

---

## Teknikstack

- **Språk**: TypeScript.
- **Frontend**: Next.js med Tailwind CSS.
- **Backend**: Node.js API.
- **Bibliotek**:
  - `pdf-parse` eller liknande för textutvinning.
  - `axios`/`fetch` för API-anrop.
- **Databas**: MongoDB (Atlas).
- **Vector-databas**: Pinecone.
- **ODM**: Mongoose.
- **LLM**: Viking 7B via Ollama.
- **AI-ramverk**: LangChain för retrieval och prompt chains.
- **Säkerhet**: bcrypt.

---

## MVP-flöde

1. Användaren laddar upp PDF, länk eller textfil.
2. Backend extraherar text.
3. Användaren skriver en fråga i chatten.
4. Backend skickar text + fråga till LLM.
5. LLM returnerar svar.
6. Svaret visas i chatten.

---

## Vidareutveckling (extended-plan.md)

### Mål

Utveckla studie-mentorn med:

- Quiz och flashcards.
- Användarprofiler och historik.

### Funktionalitet

1. **Quiz Generator**:
   - Generera flervalsfrågor från texten.
   - Visa quiz i UI och lagra resultat.
2. **Flashcards**:
   - Generera kort med fråga/svar.
   - Bläddra igenom i UI.
3. **Användarprofiler**:
   - Koppla material och historik till användare.

### Teknikstack (tillägg)

- MongoDB för att lagra quizresultat.

### Utökat Flöde

1. Ladda upp PDF.
2. Text delas upp i segment → embeddings skapas → lagras i vector store.
3. Vid frågor hämtas relevanta segment från vector store.
4. Kontext skickas till LLM → svar returneras.
5. Quiz och flashcards genereras och sparas kopplat till användarprofilen.
