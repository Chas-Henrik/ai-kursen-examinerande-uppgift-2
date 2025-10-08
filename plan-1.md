# AI Study Mentor - STAGE 1: Foundation (AI Implementation Guide)

## 🎯 STAGE 1 OVERVIEW
Build the foundational Next.js application with authentication and database connectivity. All UI text must be in Swedish.

---

## Step 1: Project Setup & Dependencies

**GOAL:** Create Next.js project with TypeScript, install all required packages, configure environment variables.

### 📋 IMPLEMENTATION CHECKLIST:

#### **1.1 Create Next.js Project**
- [ ] **Command:** `npx create-next-app@latest ai-study-mentor --typescript --tailwind --eslint --app`
- [ ] **Command:** `cd ai-study-mentor`
- [ ] **Verify:** Project created in `ai-study-mentor/` directory
- [ ] **Verify:** TypeScript and Tailwind CSS pre-configured

#### **1.2 Install Required Dependencies**
- [ ] **Command:** `npm install mongoose bcryptjs jsonwebtoken`
- [ ] **Command:** `npm install @types/bcryptjs @types/jsonwebtoken`
- [ ] **Command:** `npm install pdf-parse cheerio multer`
- [ ] **Command:** `npm install @pinecone-database/pinecone`
- [ ] **Command:** `npm install langchain @langchain/community @langchain/pinecone`
- [ ] **Command:** `npm install next-themes axios dotenv`

#### **1.3 Environment Variables Setup**
- [ ] **Create file:** `.env.local` in root directory
- [ ] **Add variables:** (Use these exact variable names)
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-study-mentor
  JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
  PINECONE_API_KEY=your-pinecone-api-key
  PINECONE_ENVIRONMENT=your-pinecone-environment
  PINECONE_INDEX_NAME=ai-study-mentor
  OLLAMA_BASE_URL=http://localhost:11434
  NODE_ENV=development
  ```
- [ ] **Create file:** `.env.example` with same variables but placeholder values

#### **1.4 Project Structure Creation**
- [ ] **Create directories:**
  - `src/components/layout/`
  - `src/components/auth/`
  - `src/components/ui/`
  - `src/lib/`
  - `src/models/`
  - `src/types/`

#### **1.5 Tailwind Configuration**
- [ ] **Edit file:** `tailwind.config.js`
- [ ] **Requirements:**
  - Enable `darkMode: 'class'`
  - Add custom colors: primary `#10A37F`, background light `#FFFFFF`, dark `#1A1A1A`
  - Add custom surface colors: light `#F7F8F8`, dark `#2D2D2D`
  - Include content path: `'./src/**/*.{js,ts,jsx,tsx}'`

#### **1.6 Basic README**
- [ ] **Edit file:** `README.md`
- [ ] **Include sections:**
  - Project description in Swedish
  - Installation instructions (`npm install`, `npm run dev`)
  - Technology stack list
  - Environment variables setup guide

### ✅ **CHECKPOINT 1:**
- [ ] Run `npm run dev` - application starts on localhost:3000
- [ ] No compilation errors in terminal
- [ ] Next.js default page displays correctly
- [ ] All dependencies installed successfully

---

## Step 2: UI Layout with Swedish Text + Dark/Light Mode

**GOAL:** Create responsive layout with header, sidebar, main content area. All text in Swedish with theme toggle.

### 📋 IMPLEMENTATION CHECKLIST:

#### **2.1 Theme Provider Setup**
- [ ] **Create file:** `src/components/providers/ThemeProvider.tsx`
- [ ] **Requirements:**
  - Import `ThemeProvider` from next-themes
  - Export provider component with `attribute="class"`
  - Enable system theme detection
  - Disable SSR flash with `suppressHydrationWarning`

#### **2.2 Layout Root Configuration**
- [ ] **Edit file:** `src/app/layout.tsx`
- [ ] **Requirements:**
  - Wrap children with ThemeProvider
  - Add Inter font import and configuration
  - Set HTML lang="sv" (Swedish)
  - Include proper metadata with Swedish title "AI Studie Mentor"

#### **2.3 Header Component**
- [ ] **Create file:** `src/components/layout/Header.tsx`
- [ ] **Requirements:**
  - Sticky header: `sticky top-0 z-50 bg-white dark:bg-gray-900`
  - Logo text: "AI Studie Mentor" (h1, text-xl, font-bold, text-primary)
  - Theme toggle button with icons: 🌙 (dark) / ☀️ (light)
  - Auth buttons: "Registrera användare", "Logga in", "Logga ut"
  - Responsive flexbox layout
  - Border bottom: `border-b border-gray-200 dark:border-gray-700`

#### **2.4 Sidebar Component**
- [ ] **Create file:** `src/components/layout/Sidebar.tsx`
- [ ] **Requirements:**
  - Fixed width on desktop: `w-64`, responsive: `hidden md:block`
  - Background: `bg-surface-light dark:bg-surface-dark`
  - Header section: "Historik" (text-lg, font-semibold)
  - "Ny Konversation" button (full width, primary color)
  - Session list area (scrollable)
  - Height: `h-screen` minus header height

#### **2.5 Main Content Area**
- [ ] **Create file:** `src/components/layout/MainContent.tsx`
- [ ] **Requirements:**
  - Flex-1 to fill remaining space
  - Chat message area (scrollable, overflow-y-auto)
  - Input section at bottom with "Ställ en fråga..." placeholder
  - "Skicka" button with primary styling
  - File upload area with "Ladda upp dokument" text
  - Responsive padding and margins

#### **2.6 Main Page Integration**
- [ ] **Edit file:** `src/app/page.tsx`
- [ ] **Requirements:**
  - Import and use Header, Sidebar, MainContent components
  - Grid layout: Header spans full width, Sidebar + MainContent side by side
  - Mobile responsive: Stack components on small screens
  - Test both light and dark themes

### ✅ **CHECKPOINT 2:**
- [ ] UI displays with Swedish text throughout
- [ ] Theme toggle switches between light/dark modes successfully
- [ ] Layout is responsive (test mobile/desktop views)
- [ ] All buttons and labels show Swedish text
- [ ] No console errors related to theme switching

---

## Step 3: MongoDB Atlas + Mongoose Schemas

**GOAL:** Connect to MongoDB Atlas, create user and document schemas with proper validation.

### 📋 IMPLEMENTATION CHECKLIST:

#### **3.1 MongoDB Connection**
- [ ] **Create file:** `src/lib/mongodb.ts`
- [ ] **Requirements:**
  - Export `connectDB()` async function
  - Use mongoose.connect() with MONGODB_URI from env
  - Implement connection caching to prevent multiple connections
  - Add error handling with Swedish error messages
  - Log connection status to console

#### **3.2 User Schema**
- [ ] **Create file:** `src/models/User.ts`
- [ ] **Requirements:**
  - Fields: `name` (String, required), `email` (String, required, unique), `password` (String, required), `createdAt` (Date, default: now)
  - Email validation with regex pattern
  - Index on email field for performance
  - Pre-save middleware for password hashing with bcrypt (salt rounds: 12)
  - Export both schema and model

#### **3.3 Document Schema**
- [ ] **Create file:** `src/models/Document.ts`
- [ ] **Requirements:**
  - Fields: `userId` (ObjectId ref User), `filename` (String), `originalText` (String), `chunks` (Array of Strings), `vectorIds` (Array of Strings), `fileType` (String), `fileSize` (Number), `uploadDate` (Date), `processed` (Boolean)
  - Index on userId for fast user queries
  - Virtual for chunk count
  - Export schema and model

#### **3.4 Chat Session Schema**
- [ ] **Create file:** `src/models/ChatSession.ts`
- [ ] **Requirements:**
  - Fields: `userId` (ObjectId ref User), `documentId` (ObjectId ref Document), `title` (String), `messages` (Array), `createdAt` (Date), `updatedAt` (Date)
  - Message sub-schema: `role` (user/assistant), `content` (String), `timestamp` (Date)
  - Population methods for user and document references
  - Export schema and model

#### **3.5 Database Connection Test**
- [ ] **Create file:** `src/app/api/test-db/route.ts`
- [ ] **Requirements:**
  - GET endpoint that tests database connection
  - Try to connect and return success/error status
  - Include user creation test
  - Return JSON with Swedish success/error messages

### ✅ **CHECKPOINT 3:**
- [ ] Visit `/api/test-db` endpoint - returns success message
- [ ] MongoDB Atlas shows successful connections in dashboard
- [ ] Can create and retrieve test user from database
- [ ] No mongoose connection warnings in console

---

## Step 4: JWT Authentication System

**GOAL:** Complete authentication with register, login, logout, protected routes, and Swedish error messages.

### 📋 IMPLEMENTATION CHECKLIST:

#### **4.1 JWT Utilities**
- [ ] **Create file:** `src/lib/jwt.ts`
- [ ] **Requirements:**
  - `generateToken(userId: string)` function with 7-day expiration
  - `verifyToken(token: string)` function that returns decoded payload
  - `getTokenFromRequest(request: Request)` helper function
  - Error handling with Swedish messages
  - Use JWT_SECRET from environment variables

#### **4.2 Register API Route**
- [ ] **Create file:** `src/app/api/auth/register/route.ts`
- [ ] **Requirements:**
  - POST method only
  - Validate: name, email, password fields
  - Check if email already exists → "E-posten används redan"
  - Hash password with bcrypt
  - Create user in database
  - Generate and return JWT token + user info (exclude password)
  - Swedish error messages for all validation failures

#### **4.3 Login API Route**
- [ ] **Create file:** `src/app/api/auth/login/route.ts`
- [ ] **Requirements:**
  - POST method only
  - Validate email and password fields
  - Find user by email → "Ogiltiga inloggningsuppgifter" if not found
  - Compare password with bcrypt → same error message if wrong
  - Generate and return JWT token + user info
  - Swedish error messages

#### **4.4 Auth Context**
- [ ] **Create file:** `src/context/AuthContext.tsx`
- [ ] **Requirements:**
  - State: `user`, `loading`, `isAuthenticated`
  - Functions: `login(email, password)`, `register(name, email, password)`, `logout()`
  - Store token in localStorage
  - Auto-login on page refresh if valid token exists
  - Clear token on logout
  - Provide context to entire app

#### **4.5 Login Form Component**
- [ ] **Create file:** `src/components/auth/LoginForm.tsx`
- [ ] **Requirements:**
  - Fields: "E-post" and "Lösenord" (Swedish labels)
  - Form validation with Swedish error messages
  - Submit calls AuthContext.login()
  - Loading state during submission
  - "Logga in" button text
  - Link to register form: "Har du inget konto? Registrera dig"

#### **4.6 Register Form Component**
- [ ] **Create file:** `src/components/auth/RegisterForm.tsx`
- [ ] **Requirements:**
  - Fields: "Namn", "E-post", "Lösenord", "Bekräfta lösenord"
  - Client-side validation with Swedish messages
  - Password confirmation check → "Lösenorden matchar inte"
  - Submit calls AuthContext.register()
  - "Registrera användare" button text
  - Link to login: "Har du redan ett konto? Logga in"

#### **4.7 Auth Integration**
- [ ] **Update file:** `src/app/layout.tsx`
- [ ] **Add:** AuthProvider wrapper around entire app
- [ ] **Update file:** `src/components/layout/Header.tsx`
- [ ] **Requirements:**
  - Show user name when logged in
  - Show "Logga ut" button when authenticated
  - Show "Logga in" / "Registrera" when not authenticated
  - Handle logout click

### ✅ **CHECKPOINT 4:**
- [ ] User can register new account successfully
- [ ] User can login with correct credentials
- [ ] User can logout and token is cleared
- [ ] Page refresh maintains login state
- [ ] Invalid credentials show Swedish error messages
- [ ] Protected routes redirect unauthenticated users

---

## 🎯 **STAGE 1 COMPLETION CRITERIA**

✅ **All checkpoints passed**
✅ **Swedish text throughout entire UI**
✅ **Authentication flow working end-to-end**
✅ **Database connectivity established**
✅ **Theme switching functional**
✅ **No console errors**

**Next Step:** Proceed to `plan-2.md` for Stage 2 (AI Features Implementation)