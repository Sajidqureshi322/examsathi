# ExamSathi AI

An AI-powered emotional wellness coach for students preparing for high-stakes exams — **NEET, JEE, UPSC, CAT, GATE, and CUET**.

ExamSathi helps students monitor and improve mental well-being through daily journaling, mood tracking, pattern discovery, and hyper-personalized wellness support.

## Features

- **Daily Journaling** — Open-ended entries with mood, study hours, and sleep tracking
- **Quick Mood Check-ins** — Energy and focus sliders for rapid emotional logging
- **AI Pattern Discovery** — Detects hidden stress triggers, recurring patterns, and burnout risk
- **Personalized Interventions** — Tailored coping strategies and mindfulness exercises
- **Sathi Chat** — Conversational AI companion for real-time empathetic support
- **Dashboard Analytics** — Mood distribution charts and wellness stats

## Tech Stack

- **Frontend:** React, Material UI (MUI), Recharts, Vite
- **Backend:** Node.js, Express
- **AI:** OpenAI GPT-4o-mini (with intelligent local fallback when no API key)
- **Storage:** In-memory (temporary — data resets when server restarts)

## Quick Start

### 1. Install dependencies

```bash
npm run install:all
```

### 2. (Optional) Enable OpenAI for enhanced AI

Copy `server/.env.example` to `server/.env` and add your key:

```
OPENAI_API_KEY=sk-your-key-here
```

Without an API key, the app uses a built-in rule-based AI engine that still demonstrates pattern discovery and personalized responses.

### 3. Run the app

**Terminal 1 — Backend:**
```bash
npm run dev:server
```

**Terminal 2 — Frontend:**
```bash
npm run dev:client
```

Open **http://localhost:3000**

## Demo Flow

1. Enter your name and select your target exam (e.g., JEE 2026)
2. Write a journal entry describing your day — mention stress, mock tests, sleep, comparison, etc.
3. Log your mood with the quick check-in
4. Go to **AI Insights** and click **Run AI Analysis**
5. Chat with **Sathi** about anxiety, burnout, or motivation

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/students` | Create student profile |
| POST | `/api/students/:id/journals` | Add journal entry |
| POST | `/api/students/:id/moods` | Log mood |
| POST | `/api/students/:id/analyze` | Run AI wellness analysis |
| POST | `/api/students/:id/chat` | Chat with Sathi |
| GET | `/api/students/:id/stats` | Get wellness statistics |

## Note on Data Storage

Student data is stored **temporarily in server memory**. All journals, moods, and chat history are lost when the server restarts. This is intentional for demo/prototype use.
