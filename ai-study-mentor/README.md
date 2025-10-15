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

| Funktion                       | Beskrivning                                                     |
| ------------------------------ | --------------------------------------------------------------- |
| 👤 **Autentisering**           | Registrera, logga in och logga ut användare (JWT, bcrypt, CSFR) |
| 🗂️ **Dokumentuppladdning**     | Ladda upp PDF.                                                  |
| 🧹 **Textutdragning**          | pdf-ts                                                          |
| 🔍 **Semantisk sökning (RAG)** | Pinecone hanterar embeddings och kontext                        |
| 🤖 **AI-svar (Ollama)**        | Gemma 3-4b svarar kort på svenska                               |
| 💬 **Chatgränssnitt**          | Svensk UI med ljust/mörkt läge och historik                     |
| 🧾 **Studiefrågor**            | Genererar 10–15 korta frågor utifrån innehållet                 |
| 💾 **Databas**                 | MongoDB Atlas lagrar användare, dokument och sessioner          |

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
