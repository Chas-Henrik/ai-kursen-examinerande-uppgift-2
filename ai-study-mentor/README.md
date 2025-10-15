# 🚀 KÖRGUIDE – AI Study Mentor

Välkommen till **AI Study Mentor** 👋  
En webbaserad studiementor där användaren kan ladda upp eget studiematerial (PDF, textfil eller webblänk) och chatta med en svensk AI-mentor som hjälper till att förstå innehållet och skapa studiefrågor.

---

## 🧩 Förutsättningar

Innan du startar:

- Node.js **v18+**
- npm (ingår i Node)
- Konto hos **MongoDB Atlas**
- Konto/API-nyckel för **Pinecone**
- **Ollama** installerat lokalt (för Viking 7B eller Gemma3-4b-modellen)

---

## ⚙️ Installation och start

1. **Klona projektet**
   ```bash
   git clone https://github.com/<ditt-repo-namn>.git
   cd ai-study-mentor
   ```

````

2. **Installera beroenden**

   ```bash
   npm install
   ```

3. **Skapa miljöfil**
   Skapa en fil i projektets rotmapp:
   `.env.local`

   ```env
   MONGODB_URI="din-mongodb-anslutningssträng"
   JWT_SECRET="valfri-hemlig-nyckel"

   PINECONE_API_KEY="din-pinecone-nyckel"
   PINECONE_ENVIRONMENT="us-east1-gcp"        # exempel
   PINECONE_INDEX="ai-study-mentor-index"

   OLLAMA_BASE_URL="http://localhost:11434"
   OLLAMA_MODEL="gemma3:4b"
   ```

4. **Starta utvecklingsservern**

   ```bash
   npm run dev
   ```

5. **Öppna appen**
   [http://localhost:3000](http://localhost:3000)

---

## 🧠 Funktioner

| Funktion                       | Beskrivning                                                |
| ------------------------------ | ---------------------------------------------------------- |
| 👤 **Autentisering**           | Registrera, logga in och logga ut användare (JWT + bcrypt) |
| 🗂️ **Dokumentuppladdning**     | Ladda upp PDF, textfil eller webblänk                      |
| 🧹 **Textutdragning**          | pdf-parse / cheerio extraherar ren text                    |
| 🔍 **Semantisk sökning (RAG)** | Pinecone hanterar embeddings och kontext                   |
| 🤖 **AI-svar (Ollama)**        | Gemma 3-4b svarar kort på svenska                          |
| 💬 **Chatgränssnitt**          | Svensk UI med ljust/mörkt läge och historik                |
| 🧾 **Studiefrågor**            | Genererar 10–15 korta frågor utifrån innehållet            |
| 💾 **Databas**                 | MongoDB Atlas lagrar användare, dokument och sessioner     |

---

## 🧪 Så här testar du

1. **Kontrollera databasanslutning**
   Gå till [http://localhost:3000/api/test-db](http://localhost:3000/api/test-db)
   → ska visa `{ "message": "MongoDB connected!" }`

2. **Registrera användare**
   Skicka `POST /api/auth/register` med JSON-data:

   ```json
   { "name": "Test", "email": "test@example.com", "password": "hemligt" }
   ```

3. **Logga in**
   `POST /api/auth/login` → returnerar JWT-token

4. **Ladda upp dokument**
   Använd knappen **“Ladda upp dokument”** i UI:t
   (PDF, .txt eller webblänk)

5. **Ställ en fråga**
   Exempel: *“Vad handlar texten om?”*
   → AI svarar på svenska i 2–4 meningar

6. **Generera studiefrågor**
   Klicka på **“Generera studiefrågor”** → AI skapar en lista med korta frågor.

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
Logga in → Ladda upp → Ställ en fråga → Få svenska AI-svar ✨

```
````
