# Stage 1 Plan — AI Studiementor

## 🎯 Mål
Bygga grunden för **AI Studiementor**, en webbapplikation med svensk användarupplevelse, ansluten MongoDB-databas och säker autentisering.  
Efter detta steg ska appen kunna köras lokalt med fungerande UI, databasanslutning och inloggningssystem.

---

## 🧩 Projektbeskrivning
Syftet med Stage 1 är att skapa en stabil teknisk bas innan AI-funktionalitet läggs till.  
Användaren ska kunna:
- Registrera sig, logga in och logga ut.
- Se ett svenskt gränssnitt med header, sidomeny och chattlayout.
- Växla mellan ljust och mörkt läge.
- Ansluta till MongoDB Atlas där användardata lagras säkert.

När denna fas är klar ska strukturen, databasen och stilen vara redo för nästa fas (AI-integration).

---

## ⚙️ Teknisk stack
| Lager | Teknik | Syfte |
|-------|---------|-------|
| **Språk** | TypeScript | Frontend och backend |
| **Ramverk** | Next.js | Routing, SSR, API routes |
| **Stil** | Tailwind CSS | Responsiv design |
| **Tema** | next-themes | Mörkt/ljust läge |
| **Databas** | MongoDB Atlas | Lagring av användardata |
| **ODM** | Mongoose | Datamodellering |
| **Autentisering** | JWT | Inloggning och sessionshantering |
| **Säkerhet** | bcrypt | Lösenordshashning |
| **Miljöhantering** | dotenv | Hantering av miljövariabler |

---

## 🧱 Funktionalitet (Stage 1)

### 1️⃣ Projektuppsättning
- Skapa ett nytt **Next.js-projekt med TypeScript**.
- Installera alla nödvändiga beroenden (Tailwind, Mongoose, bcrypt, jsonwebtoken, dotenv, next-themes).
- Konfigurera `.env.local` med:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - Primärfärg (#10A37F)
- Ställ in Tailwind CSS med grundläggande färgpalett inspirerad av ChatGPT (#10A37F som primär).
- **Checkpoint:** Appen startar och kompilerar utan fel.

---

### 2️⃣ UI-layout (Svenska + Ljus/Mörk läge)
- Skapa en **Layout-komponent** som omsluter hela appen.
- Lägg till:
  - Header med texten “AI Studiementor”.
  - Sidomeny (sidebar) med rubriken “Historik”.
  - Huvudyta för chatt.
- Implementera tema-växling (ljus/mörk) via `next-themes`.
- All text i gränssnittet ska vara **på svenska**.
- **Checkpoint:** Tema-växling fungerar, UI visas korrekt.

---

### 3️⃣ MongoDB-anslutning
- Anslut till **MongoDB Atlas** med Mongoose.
- Skapa en återanvändbar anslutningsfil.
- Lägg till en enkel test-API-route `/api/test-db` som bekräftar att databasen är ansluten.
- **Checkpoint:** Test-API svarar med “MongoDB connected!”.

---

### 4️⃣ Autentisering (JWT)
- Skapa API-routes för:
  - **Registrering** (`/api/auth/register`)
  - **Inloggning** (`/api/auth/login`)
  - **Utloggning** (frivilligt eller del av frontend)
- Använd bcrypt för lösenordshashning.
- Generera JWT-token för att hantera användarsessioner.
- Spara användare i databasen med fält: `name`, `email`, `password`.
- I headern ska det finnas knappar för:
  - “Logga in”
  - “Logga ut”
  - “Registrera ny användare”
- **Checkpoint:** Registrering, inloggning och skyddade routes fungerar.

---

## ✅ Slutmål för Stage 1
Vid slutet av detta steg ska applikationen ha:
- Ett fungerande svenskt användargränssnitt (header, sidebar, chattyta)
- Ljust/mörkt läge via tema-växling
- Ansluten MongoDB Atlas-databas
- Säker autentisering med JWT och bcrypt
- Stabil projektstruktur, redo för nästa fas

---