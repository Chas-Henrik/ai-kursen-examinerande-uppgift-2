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
   ```bash
   MONGODB_URI="mongodb+srv://anvandare:losenord@cluster.mongodb.net/ai-study-mentor"
   JWT_SECRET="byt-mig"  
   NEXTAUTH_SECRET="byt-mig-ocksa"
   ````

5. **Starta utvecklingsservern**

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
| 🧾 **Studiefrågor**            | Genererar 10 korta frågor och svar utifrån innehållet      |
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

🧠 Reflektion kring AI-komponenten

### Vilken ny AI-teknik/bibliotek identifierades och hur tillämpades det?

Under projektet testade vi flera AI-verktyg och bibliotek för att jämföra deras kapacitet att både generera kod och driva själva applikationen:

#### Gemini CLI (Google) 
– användes för kodgenerering och visade sig ge mest robust och välstrukturerad kod utifrån samma implementationsplan.

#### Codex (OpenAI) 
– presterade bättre vid skapandet av UI-komponenter, men saknade stabilitet och helhet jämfört med Gemini. Användes dock i slutversionen. 

#### GitHub Copilot 
– användes som kodstöd vid mindre moment, men inte som huvudmotor.

I den färdiga applikationen implementerades tre centrala AI-komponenter:

#### Ollama + Gemma 3:4B
– Lokalt körd LLM (Large Language Model) för att analysera uppladdade dokument och besvara användarens frågor.
– Valdes för sin höga prestanda, enkel lokalintegration och att den kan köras helt kostnadsfritt under utveckling.

#### Pinecone
– Används som vektorbaserad databas i ett RAG-flöde (Retrieval-Augmented Generation).
– Lagrar embeddings av dokumentens textstycken och hämtar de mest relevanta delarna när användaren ställer en fråga, vilket ger AI:n rätt kontext.

#### Hugging Face Transformers Embeddings
– Denna modell användes för att skapa semantiska text-embeddingar av dokumenten innan de skickades till Pinecone.
– all-MiniLM-L6-v2 valdes eftersom den är lättviktig, snabb, gratis och erbjuder bra balans mellan noggrannhet och prestanda vid semantisk sökning.
– Kombinationen av denna embeddings-modell och Pinecone gjorde RAG-lösningen både effektiv och resurssnål.



### Motivering till val av teknik och bibliotek

Vi valde Gemini för utvecklingsfasen eftersom den producerade den mest konsekventa och läsbara koden, särskilt vid integration mellan frontend och backend.

För AI-komponenten valdes Ollama + Gemma 3:4B eftersom:
den kan köras gratis och lokalt, perfekt under utveckling,
den hanterar större dokument stabilt,
den har bra kompatibilitet med Pinecone,
och den kräver inga externa API-kostnader.

För textförståelse och sökbarhet användes Hugging Face MiniLM-modellen eftersom den tillförde semantisk sökfunktionalitet som var helt nödvändig för att RAG-arkitekturen skulle fungera korrekt.

Vid fortsatt utveckling eller kommersiell lansering kan dessa komponenter enkelt bytas ut mot mer avancerade alternativ som OpenAI GPT-4o eller Claude, vilket skulle förbättra precision och svarskvalitet ytterligare.



### Varför behövdes AI-komponenten? Skulle ni kunna löst det på ett annat sätt?

AI-komponenten är **helt nödvändig** för att applikationen ska fungera som tänkt. Systemets huvudsyfte är att låta användaren ladda upp egna dokument (t.ex. PDF:er eller textfiler) och därefter ställa frågor om innehållet. För att kunna analysera text över flera sidor, förstå sammanhang och ge korrekta, kontextuella svar krävs **språklig förståelse och semantisk tolkning** något som endast en AI-modell kan erbjuda.

Att försöka lösa detta utan AI hade i praktiken inte varit möjligt.
En traditionell lösning, som exempelvis:

* enkel **text- eller nyckelordsökning**,
* eller **regex-baserade filter**,
  hade bara kunnat hitta exakta ord eller fraser och inte förstå meningen bakom användarens fråga.

AI-komponenten (genom LLM + RAG) gör däremot att applikationen **förstår betydelsen** av frågan, **matchar rätt kontext** ur dokumentet och **formulerar ett naturligt svar**.
Det är därför inte realistiskt att ersätta AI-delen med klassisk programmering om målet är att användaren ska kunna konversera fritt kring sitt eget material.

Utan AI hade applikationen bara kunnat **söka textsträngar**, men inte **förstå innehåll**.
Med AI blir det istället möjligt att **analysera, resonera och svara som en mänsklig studieassistent**.


