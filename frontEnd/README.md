# Fact Checker — Frontend

A React-based web application for AI-powered claim verification. Users can submit claims, view verification results with supporting sources, browse their verification history, and explore analytics dashboards.

## Prerequisites

Make sure the following are installed on your machine:

- **Node.js** (v18 or later) — [https://nodejs.org](https://nodejs.org)
- **npm** (comes with Node.js)

You can verify by running:

```bash
node -v
npm -v
```

## Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd frontEnd
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   The app will be available at **http://localhost:5173**.

## Before You Start

The frontend requires the **backend** and the **AI service** to be running:

1. **Backend** (Express + Prisma) — must be running on port `3000`:

   ```bash
   cd backEnd
   npm install
   npx prisma generate
   npx prisma migrate dev
   node index.js
   ```

   The backend needs a `.env` file with:
   ```
   JWT_SECRET="your_secret_here"
   AI_API_URL=http://127.0.0.1:8001/verify
   ```

2. **AI Service** (Python + FastAPI) — must be running on port `8001`:

   ```bash
   cd ai-service
   pip install -r requirements.txt
   pip install pydantic-settings
   pip install ddgs
   uvicorn app.main:app --port 8001
   ```

## Usage

1. Open **http://localhost:5173** in your browser.
2. **Register** a new account or **Login** with existing credentials.
3. Use the top navigation to switch between pages:
   - **Fact Checker** — Enter a claim to verify. The AI analyzes it and returns a verdict (True / False / Mixed / Unverified) with confidence score and supporting sources.
   - **Analytics Dashboard** — View overall statistics, verdict distribution, verification trends over time, and top referenced sources.
   - **History** — Browse a paginated, filterable list of your past verifications. Filter by verdict, date range, or search by claim text.
4. The app supports **English** and **Arabic** (with RTL layout). Toggle the language using the globe icon in the toolbar.
5. Toggle **dark/light mode** using the theme icon in the toolbar.

## Available Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `npm run dev`    | Start the Vite development server        |
| `npm run build`  | Build for production (outputs to `dist/`) |
| `npm run preview`| Preview the production build locally     |
| `npm run lint`   | Run ESLint checks                        |

## Tech Stack

| Technology         | Purpose                          |
| ------------------ | -------------------------------- |
| React 19           | UI framework                     |
| Vite 7             | Build tool & dev server          |
| Material UI (MUI) 7| Component library                |
| React Router 6     | Client-side routing              |
| TanStack React Query 5 | Server state management     |
| Axios              | HTTP client                      |
| i18next            | Internationalization (EN / AR)   |
| Emotion + stylis-plugin-rtl | Styling with RTL support |

## Project Structure

```
frontEnd/
├── public/                    # Static assets
├── src/
│   ├── App.jsx                # Root component (RTL, theme, routing)
│   ├── main.jsx               # Entry point (React Query provider)
│   ├── components/
│   │   └── shared/
│   │       ├── toolBar.jsx        # Top navigation bar (language, theme, logout)
│   │       └── protectedRoutes.jsx # Auth guard wrapper
│   ├── config/
│   │   ├── api.js             # Axios instance with JWT interceptor
│   │   ├── routes.jsx         # React Router configuration (5 routes)
│   │   ├── theme.js           # MUI theme (dark green + gold palette)
│   │   ├── themeConfig.jsx    # Theme context provider (dark/light toggle)
│   │   └── i18n/
│   │       ├── index.js       # i18next setup
│   │       └── languages/
│   │           ├── ar/translation.json   # Arabic translations
│   │           └── en/translations.json  # English translations
│   ├── pages/
│   │   ├── factCheckPage.jsx      # AI claim verification UI
│   │   ├── statisticsPage.jsx     # Analytics dashboard (Recharts)
│   │   ├── historyPage.jsx        # Paginated verification history
│   │   ├── loginPage.jsx          # Login form
│   │   └── registerPage.jsx       # Registration form
│   ├── repository/                # React Query hooks (data layer)
│   │   ├── factCheck.js           # useVerifyClaim, useStatistics, useHistory, useTopSources, useTrends
│   │   └── user.js                # useRegister, useLogin
│   └── services/                  # Axios request functions (API layer)
│       ├── factCheck.js           # verifyClaimRequest, getStatsRequest, getHistoryRequest, etc.
│       └── user.js                # register, login
├── package.json
├── vite.config.js
└── index.html
```

## Architecture Summary

The frontend follows a **3-layer architecture**:

```
Pages (UI) → Repository (React Query hooks) → Services (Axios calls) → Backend API
```

- **Services layer** (`services/`): Raw Axios HTTP calls to the backend REST API. Each function maps to one endpoint.
- **Repository layer** (`repository/`): React Query hooks (`useQuery` / `useMutation`) that wrap services with caching, refetching, and invalidation logic.
- **Pages layer** (`pages/`): React components that consume repository hooks and render the UI using MUI components.

### Routes

| Path           | Page              | Auth Required | Description                              |
| -------------- | ----------------- | ------------- | ---------------------------------------- |
| `/login`       | LoginPage         | No            | User login                               |
| `/register`    | RegisterPage      | No            | User registration                        |
| `/fact-check`  | FactCheckPage     | Yes           | Submit claims for AI verification        |
| `/statistics`  | StatisticsPage    | Yes           | Analytics dashboard with charts          |
| `/history`     | HistoryPage       | Yes           | Paginated, filterable verification log   |

### Key Features

- **AI Fact-Checking**: Submit any claim → AI returns verdict (True/False/Mixed), confidence score, analysis summary, and supporting/contradicting sources with similarity scores.
- **Analytics Dashboard**: Donut chart (verdict distribution), radial gauge (confidence), area chart (trends over time with day/week/month toggle), horizontal bar chart (top sources), source stance pie chart, animated stat cards.
- **Verification History**: Paginated table with filters by verdict, date range, and text search.
- **Bilingual**: Full English/Arabic support with automatic RTL layout switching.
- **Dark/Light Mode**: Theme toggle persisted in state.
- **Auth**: JWT-based authentication with automatic token injection via Axios interceptor.
