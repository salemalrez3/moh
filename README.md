# Fact Checker — AI-Powered Claim Verification System

A full-stack web application that uses AI and NLP to verify textual claims against online sources. The system consists of three parts: a **React frontend**, a **Node.js/Express backend**, and a **Python/FastAPI AI service**.

---

## Architecture

```
┌─────────────┐       ┌──────────────┐       ┌──────────────────┐
│   Frontend   │──────▶│   Backend    │──────▶│   AI Service     │
│  React :5173 │◀──────│ Express :3000│◀──────│  FastAPI :8001   │
└─────────────┘       └──────┬───────┘       └──────────────────┘
                             │                  NLP Pipeline:
                             ▼                  • Web search
                        ┌─────────┐             • Source retrieval
                        │ SQLite  │             • Stance detection
                        │ (Prisma)│             • Verdict aggregation
                        └─────────┘
```

**Frontend → Backend → AI Service → Backend → Database → Frontend**

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite 7, MUI 7, React Router, React Query, Axios, Recharts, i18next |
| Backend | Node.js, Express, Prisma ORM, SQLite, JWT |
| AI Service | Python, FastAPI, spaCy, Hugging Face Transformers, DuckDuckGo Search |

---

## Database Schema

Three tables: **User**, **ClaimCheck**, **Source**

- `User` → has many `ClaimCheck`
- `ClaimCheck` → has many `Source`

Each claim verification stores the verdict, confidence score, analysis summary, and all retrieved sources with their stance and similarity score.

---

## Features

- **AI Fact-Checking** — Submit a claim → AI searches the web, retrieves sources, detects stance, and returns a verdict (True / False / Mixed / Unverified) with confidence score
- **Analytics Dashboard** — Charts for verdict distribution, confidence gauge, trends over time, top sources
- **Verification History** — Paginated, filterable list of past checks
- **Bilingual** — English & Arabic with automatic RTL layout
- **Dark / Light Mode**
- **JWT Authentication** — Register, login, protected routes

---

## How to Run

### Prerequisites

- **Node.js** v18+ — [nodejs.org](https://nodejs.org)
- **Python** 3.10+ — [python.org](https://python.org)

### 1. AI Service (port 8001)

```bash
cd ai-service
pip install -r requirements.txt
pip install pydantic-settings
pip install ddgs
uvicorn app.main:app --port 8001
```

### 2. Backend (port 3000)

Create `backEnd/.env`:
```
JWT_SECRET="your_secret_here"
AI_API_URL=http://127.0.0.1:8001/verify
```

Then run:
```bash
cd backEnd
npm install
npx prisma generate
npx prisma migrate dev
node index.js
```

### 3. Frontend (port 5173)

```bash
cd frontEnd
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Usage

1. **Register** a new account or **Login**
2. **Fact Checker** — Enter any claim to verify it with AI
3. **Dashboard** — View analytics and charts
4. **History** — Browse and filter past verifications
5. **Toolbar** — Switch language (EN/AR) and toggle dark/light mode

---

## Frontend Architecture

```
Pages (UI)  →  Repository (React Query hooks)  →  Services (Axios calls)  →  Backend API
```

| Path | Page | Description |
|------|------|-------------|
| `/login` | LoginPage | User login |
| `/register` | RegisterPage | User registration |
| `/fact-check` | FactCheckPage | Submit claims for AI verification |
| `/statistics` | StatisticsPage | Analytics dashboard with charts |
| `/history` | HistoryPage | Filterable verification history |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/user/register` | Register new user |
| `POST` | `/user/login` | Login → returns JWT |
| `POST` | `/verify` | Submit claim for AI verification |
| `GET` | `/stats` | Dashboard statistics |
| `GET` | `/verify/history` | Paginated user history |
| `GET` | `/verify/top` | Top referenced sources |
| `GET` | `/verify/trends` | Verdict trends over time |
