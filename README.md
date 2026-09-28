<div align="center">

# OfferForge AI

### Structured mock interviews that feel like the real thing

[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind%20%7C%20Framer%20Motion-orange.svg)](https://vitejs.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20MongoDB-green.svg)](https://nodejs.org/)
[![AI](https://img.shields.io/badge/AI-Gemini%20%7C%20OpenRouter-purple.svg)](https://aistudio.google.com/)

</div>

---

## What it does

Pick a role and a level, and OfferForge runs a full interview loop split into the same sections a real panel uses. An SDE round, for example, is two DSA problems, then two system design questions, then OOP, CS fundamentals, and a behavioral question.

Every answer is graded against its section's own rubric (DSA is judged on approach, complexity, edge cases, and clarity; behavioral on context, ownership, impact, and reflection). At the end you get a score per section, a hire / no-hire call, and a list of what to practice next.

## Roles and sections

| Role | Sections (questions) |
|---|---|
| Software Development Engineer | DSA (2) · System Design (2) · OOP (2) · CS Fundamentals (2) · Behavioral (1) |
| Frontend Developer | JavaScript (2) · React (2) · Web Fundamentals (2) · DSA (1) · Behavioral (1) |
| Backend Developer | DSA (2) · APIs & Backend (2) · Databases (2) · System Design (2) · Behavioral (1) |
| Data Analyst | SQL (2) · Statistics (2) · Analytics Case (2) · Behavioral (1) |
| Data Scientist | Statistics (2) · Machine Learning (2) · SQL (2) · Behavioral (1) |
| Business Analyst | Requirements (2) · Analytics Case (2) · SQL (1) · Behavioral (2) |
| Product Manager | Product Sense (2) · Metrics (2) · Execution (2) · Behavioral (2) |

Levels: Entry, Mid, Senior. Everything above is defined in one file, [`backend/src/config/interviewRoles.js`](backend/src/config/interviewRoles.js). To add a role or change a section's question count or rubric, edit it there and the API and UI pick it up.

## How grading works

- The AI scores each of the section's 4 rubric criteria from 0 to 10. The answer score is their average × 10.
- Verdicts: 85+ Strong, 70+ Solid, 50+ Partial, below 50 Weak. Skipped questions score 0.
- The overall score is the average across all questions. 85+ is Strong hire, 70+ Hire, 55+ Lean no hire, below that No hire.
- If the AI provider is down or the key is invalid, questions come from a curated built-in bank and answers are marked **Not graded**. The app never makes up a score.

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Lenis, Lucide icons |
| Backend | Node.js, Express, Mongoose, JWT, bcryptjs |
| Database | MongoDB (Atlas) |
| AI | Google Gemini (default) or any OpenRouter model |

## Project structure

```text
OfferForge-AI/
├── api/index.js                  # Vercel serverless entry (re-exports backend/server.js)
├── backend/
│   ├── server.js                 # Express app, CORS, MongoDB connection
│   └── src/
│       ├── config/interviewRoles.js   # Roles, sections, rubrics, fallback question bank
│       ├── controllers/          # auth, interview, analytics
│       ├── middleware/           # JWT guard, error handler
│       ├── models/               # User, Interview, Response
│       ├── routes/               # /api/auth, /api/interviews, /api/analytics
│       └── services/ai.service.js     # Question generation, rubric grading, debrief
└── frontend/
    └── src/
        ├── components/           # Layout, motion primitives, ScoreRing, AuthLayout
        ├── pages/                # Home, Login, Register, Dashboard, InterviewPage, ResultsPage
        ├── services/             # Axios client, auth storage, role catalog
        └── App.jsx               # Routes and page transitions
```

## Running locally

Requirements: Node.js 18+, a MongoDB connection string, and a Gemini API key (free at [aistudio.google.com](https://aistudio.google.com)).

**Backend**

```bash
cd backend
npm install
cp .env.example .env    # then fill it in
npm run dev             # http://localhost:5000
```

`backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/offerforge
JWT_SECRET=<long random string>
AI_PROVIDER=gemini
AI_API_KEY=<your Gemini key>
# AI_MODEL is optional. Defaults: gemini-3.5-flash-lite for Gemini, openai/gpt-4o-mini for OpenRouter
FRONTEND_URL=http://localhost:5173
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env    # set VITE_API_URL=http://localhost:5000/api
npm run dev             # http://localhost:5173
```

## API

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | No | Create account / sign in (returns JWT) |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/interviews/roles` | No | Role and section catalog |
| POST | `/api/interviews/start` | Yes | Start a round: `{ roleId, difficulty }` |
| GET | `/api/interviews/:id/next-question` | Yes | Current question (idempotent) |
| POST | `/api/interviews/:id/answer` | Yes | Submit `{ answer, timeSpent }`, returns graded response |
| POST | `/api/interviews/:id/skip` | Yes | Skip the current question |
| POST | `/api/interviews/:id/complete` | Yes | Finish and generate the debrief |
| GET | `/api/interviews/:id`, `/api/interviews/history` | Yes | Results and history |
| GET | `/api/analytics/dashboard` | Yes | Stats, section averages, trend |

## Deployment

- **Render + Vercel:** deploy `backend/` to Render as a web service (see `render.yaml`) with the env vars above, and deploy `frontend/` to Vercel with `VITE_API_URL=https://<your-render-service>.onrender.com/api`.
- **Vercel only:** the root `vercel.json` builds the frontend and serves the API from `api/index.js`. Set the backend env vars in the Vercel project.

Never commit `.env` files.

## Author

**Lovjyot Singh** · [@LovjyotSingh](https://github.com/LovjyotSingh)
