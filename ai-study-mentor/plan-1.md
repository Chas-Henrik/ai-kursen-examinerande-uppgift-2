Here’s a fully structured `step-by-step plan-1.md` file based on your instructions:

---

# **📘 step-by-step plan-1.md – Core Setup & Foundation**

## **Goal**

Build the foundation for the **AI Study Mentor** web application with:

* Local Next.js + TypeScript setup
* Swedish UI with header, sidebar, chat area
* Light/Dark theme toggle
* MongoDB connection
* Secure user authentication (JWT + bcrypt)

---

## **Step 1: Project Initialization**

1. Create project folder:

```bash
mkdir ai-study-mentor && cd ai-study-mentor
```

2. Initialize Next.js with TypeScript:

```bash
npx create-next-app@latest . --typescript
```

3. Install dependencies:

```bash
npm install tailwindcss postcss autoprefixer next-themes mongoose bcrypt jsonwebtoken dotenv
```

4. Initialize Tailwind CSS:

```bash
npx tailwindcss init -p
```

5. Configure Tailwind colors (primary: `#10A37F`) in `tailwind.config.js`.

6. Create `.env.local` with secrets:

```
MONGODB_URI=<your-mongo-uri>
JWT_SECRET=<your-jwt-secret>
```

**Checkpoint:**

```bash
npm run dev
```

→ Ensure default Next.js page compiles.

---

## **Step 2: Layout & UI (Swedish)**

1. Create `components/Layout.tsx` wrapping all pages.
2. Add header:

```text
AI Studiementor
```

3. Add sidebar with `Historik` and main chat area.
4. Install `next-themes` and implement theme toggle button.
5. Translate all UI text into Swedish.

**Checkpoint:**
Toggle theme → Dark/light mode works, Swedish UI displayed.

---

## **Step 3: MongoDB Connection**

1. Create `/lib/mongodb.ts`:

```ts
import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

export default connectDB;
```

2. Create test API route `/pages/api/test-db.ts`:

```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();
    res.status(200).json({ message: 'MongoDB connected!' });
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
}
```

**Checkpoint:**
Visit `/api/test-db` → `{"message":"MongoDB connected!"}`

---

## **Step 4: Authentication (JWT + bcrypt)**

1. Create `models/User.ts`:

```ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
```

2. Create API routes:

* `/pages/api/auth/register.ts` → hash password with bcrypt, save user
* `/pages/api/auth/login.ts` → verify password, generate JWT token

3. Add header buttons:

```
Logga in | Logga ut | Registrera ny användare
```

4. Protect routes using JWT middleware.

**Checkpoint:**
Register → Login → Access protected route → Logout.

---

## **✅ End of Stage 1**

By now, the application has:

* Swedish UI (header, sidebar, theme toggle)
* Light/Dark mode
* Connected MongoDB Atlas
* Secure authentication with JWT
* Clean project structure

Next step: **Stage 2 – AI Integration & Advanced Features**

---

If you want, I can also make a **more visual, actionable checklist version** of this plan with **commands, file paths, and tasks for each day**, so it’s ready to follow step-by-step. It’s like a “developer playbook” for Stage 1. Do you want me to do that?
