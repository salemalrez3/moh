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
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   └── shared/          # Toolbar, protected route wrapper
│   ├── config/
│   │   ├── api.js           # Axios instance with auth interceptor
│   │   ├── routes.jsx       # React Router configuration
│   │   ├── theme.js         # MUI theme
│   │   ├── themeConfig.jsx  # Theme + dark mode provider
│   │   └── i18n/            # Translation files (EN, AR)
│   ├── pages/               # Page components
│   │   ├── factCheckPage    # Claim verification
│   │   ├── statisticsPage   # Analytics dashboard
│   │   ├── historyPage      # Verification history
│   │   ├── loginPage        # Login
│   │   └── registerPage     # Registration
│   ├── repository/          # React Query hooks
│   ├── services/            # API call functions
│   └── utility/             # Helper functions
├── package.json
└── vite.config.js
```

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
