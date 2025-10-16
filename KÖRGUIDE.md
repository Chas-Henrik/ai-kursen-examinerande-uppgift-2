# 🚀 KÖRGUIDE – AI Study Mentor

Välkommen till **AI Study Mentor** 👋  
En webbaserad studiementor där användaren kan ladda upp eget studiematerial (PDF) och chatta med en svensk AI-mentor som hjälper till att förstå innehållet och skapa studiefrågor.

---

## 🧩 Förutsättningar

Innan du startar:

- Node.js **v18+**
- npm (ingår i Node)
- Konto hos **MongoDB Atlas**
- Konto/API-nyckel för **Pinecone**
- **Ollama** installerat lokalt (Gemma3-4b-modellen)

---

## ⚙️ Installation och start

1. **Klona projektet**

   ```bash
   git clone https://github.com/<ditt-repo-namn>.git
   cd ai-study-mentor
   ```

2. **Installera beroenden**

   ```bash
   npm install


   ollama pull gemma3:4b
   ```

3. **Skapa miljöfil**
   Skapa en fil i projektets rotmapp:
   `.env.local`

   ```env

   MONGODB_URI="mongodb+srv://<User>:<Password>@cluster0.r6jzab0.mongodb.net/aiStudyMentorDatabase?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET=<Your JWT Secret>
PINECONE_API_KEY=<Your Pinecone API Key>
NODE_ENV=development # change to 'production' in production

   ```

# MongoDB Atlas connection string

MONGODB_URI="mongodb+srv://anvandare:losenord@cluster.mongodb.net/ai-study-mentor"

# JWT secret for auth tokens

JWT_SECRET="byt-mig"

# Optional: NextAuth secret if we integrate next-auth later

NEXTAUTH_SECRET="byt-mig-ocksa"

````

4. **Starta utvecklingsservern**

```bash
npm run dev
````

5. **Öppna appen**
   [http://localhost:3000](http://localhost:3000)

---

## 🧠 Funktioner

| Funktion                       | Beskrivning                                                |
| ------------------------------ | ---------------------------------------------------------- |
| 👤 **Autentisering**           | Registrera, logga in och logga ut användare (JWT, bcrypt)  |
| 🗂️ **Dokumentuppladdning**     | Ladda upp PDF.                                             |
| 🧹 **Textutdragning**          | pdf-ts extraherar ren text                                 |
| 🔍 **Semantisk sökning (RAG)** | Pinecone hanterar embeddings och kontext                   |
| 🤖 **AI-svar (Ollama)**        | Gemma 3-4b svarar kort på samma språk som frågan ställs på |
| 💬 **Chatgränssnitt**          | Svensk UI med ljust/mörkt läge och historik                |
| 🧾 **Studiefrågor**            | Genererar 10 korta frågor utifrån innehållet               |
| 💾 **Databas**                 | MongoDB Atlas lagrar användare, dokument och sessioner     |

---

## 🧪 Så här testar du

1. **Registrera användare**
   Skicka `POST /api/auth/register` med JSON-data:

   ```json
   { "name": "Test", "email": "test@example.com", "password": "hemligt" }
   ```

2. **Logga in**
   `POST /api/auth/login` → returnerar CSRF-token

3. **Ladda upp dokument**
   Använd knappen **“Ladda upp dokument”** i UI:t
   (PDF)

4. **Ställ en fråga**
   Exempel: _“Vad handlar texten om?”_
   → AI svarar på svenska kort och koncist

5. **Generera studiefrågor**
   AI skapar en lista med korta frågor & tillhörande svar

---

## 💡 Vanliga problem

| Problem                    | Orsak / Lösning                                                   |
| -------------------------- | ----------------------------------------------------------------- |
| `MongoDB connection error` | Kontrollera `MONGODB_URI` och att IP är vitlistad i Atlas         |
| `Pinecone index not found` | Skapa ett index i Pinecone-dashboard med samma namn som i `.env`  |
| `Ollama not responding`    | Kontrollera att Ollama-servern körs lokalt: `ollama serve`        |
| `JWT_SECRET missing`       | Se till att `JWT_SECRET` finns i `.env.local`                     |
| Chatten svarar inte        | Kontrollera API-nycklar och att Pinecone/Ollama-tjänster är igång |

---

## 📦 Bygga för produktion

```bash
npm run build
npm start
```

Servern körs då på port **3000** (eller den du anger i miljövariabler).

---

## 🏁 Kort sammanfattning

```bash
git clone <repo>
npm install
cp .env.example .env.local
npm run dev
```

Öppna → [http://localhost:3000](http://localhost:3000)
Logga in → Ladda upp → Ställ en fråga → Få svar baserat på innehållet i uppladdat dokument ✨

```

```

## 🧠 Reflektion kring AI-komponenten

### Vilken ny AI-teknik/bibliotek identifierades och hur tillämpades det?

Under projektet testade vi flera AI-verktyg och bibliotek för att jämföra deras kapacitet att generera kod och driva applikationen:

* **Gemini (Google)** – användes för att generera kod och visade sig ge mest robust och strukturerad kod utifrån samma implementationsplan.
* **Codex (OpenAI)** – fungerade bättre för att skapa UI och komponentlogik, men var mindre konsekvent i backend-hanteringen.
* **GitHub Copilot** – användes som stöd vid mindre kodsnuttar, men inte som huvudkomponent.

I själva applikationen implementerades:

* **Ollama + Gemma 3:4B** som lokal LLM-komponent för att analysera uppladdade dokument och svara på användarens frågor.
* **Pinecone** som vektorbaserad databas i ett **RAG-flöde (Retrieval-Augmented Generation)** för att lagra och hämta relevanta text-embeddingar. Detta gör att modellen endast får den mest relevanta kontexten när den genererar svar.

### Motivering till val av teknik och bibliotek

Vi valde **Gemini** för utvecklingsfasen eftersom den producerade tydlig, sammanhängande och välorganiserad kod för hela projektet, särskilt vid komplexa integrationer mellan frontend och backend.

För den faktiska AI-funktionen valde vi **Ollama + Gemma 3:4B** eftersom:

* modellen kan köras **gratis och lokalt**, vilket gör den idealisk under utveckling,
* den hanterar **större dokument** på ett stabilt sätt,
* den har **bra stöd för Pinecone**, vilket underlättar RAG-implementationen,
* och den **inte kräver moln-API-kostnader**.

Vid fortsatt utveckling skulle man dock kunna uppgradera till en mer avancerad modell, som **GPT-4o** eller **Claude 3**, för att förbättra precision och svarskvalitet i en produktionsmiljö.

---

### Varför behövdes AI-komponenten? Skulle ni kunna löst det på ett annat sätt?

AI-komponenten är **helt nödvändig** för att applikationen ska fungera som tänkt. Systemets huvudsyfte är att låta användaren ladda upp egna dokument (t.ex. PDF:er eller textfiler) och därefter ställa frågor om innehållet. För att kunna analysera text över flera sidor, förstå sammanhang och ge korrekta, kontextuella svar krävs **språklig förståelse och semantisk tolkning** — något som endast en AI-modell kan erbjuda.

Att försöka lösa detta utan AI hade i praktiken inte varit möjligt.
En traditionell lösning, som exempelvis:

* enkel **text- eller nyckelordsökning**,
* eller **regex-baserade filter**,
  hade bara kunnat hitta exakta ord eller fraser — inte förstå meningen bakom användarens fråga.

AI-komponenten (genom LLM + RAG) gör däremot att applikationen **förstår betydelsen** av frågan, **matchar rätt kontext** ur dokumentet och **formulerar ett naturligt svar**.
Det är därför inte realistiskt att ersätta AI-delen med klassisk programmering om målet är att användaren ska kunna konversera fritt kring sitt eget material.

Kort sagt:
👉 Utan AI hade applikationen bara kunnat **söka textsträngar**, men inte **förstå innehåll**.
Med AI blir det istället möjligt att **analysera, resonera och svara som en mänsklig studieassistent**.

---

Vill du att jag lägger till en **kort inledande sammanfattning (2–3 meningar)** i toppen av denna reflektion — t.ex. en beskrivning av syftet med att använda AI i projektet — så README:n får en mer berättande ton?

