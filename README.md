# Customer Support AI Triage

An intelligent support ticket classifier that uses AI to automatically categorize issues and generate draft responses. Built with React, Express, and AI APIs to demonstrate rapid full-stack development.

## Why This Project

Support teams spend significant time manually triaging incoming tickets. This project automates that workflow by leveraging AI to classify issues by category and severity, while generating contextualized draft replies.

It's a practical demonstration of:
- AI integration in production workflows
- Real-time classification and content generation
- Full-stack rapid development using AI-assisted coding

## How It Works

1. **Customer Input** — A support agent pastes a customer message into the React dashboard
2. **AI Processing** — The Express backend sends the message to OpenAI or Gemini
3. **Structured Output** — The AI returns:
   - Category (e.g., "Account Access", "Billing", "Technical Issue")
   - Severity (low, medium, high, critical)
   - Summary (one-line description)
   - Draft Reply (ready-to-send email template)
4. **Instant Feedback** — Results appear in the dashboard for review and action

## Tech Stack

**Frontend**
- React + Vite (fast build, modern tooling)
- TypeScript (type safety)
- Responsive UI for quick triage review

**Backend**
- Express.js on Node.js
- TypeScript for maintainability
- Pluggable AI provider abstraction (OpenAI, Gemini)

**AI**
- OpenAI API (default: `gpt-4o-mini` for cost-efficiency)
- Gemini API (optional swap-in)
- Structured JSON responses for reliable parsing

## Development Approach

This project was built using **AI-assisted rapid development** with GitHub Copilot, emphasizing quick iteration and pragmatic architecture over premature optimization. The workflow:

1. Define the user flow and API contract
2. Use Copilot for boilerplate and implementation hints
3. Validate with end-to-end testing
4. Refine based on actual execution

This mirrors real-world startup and scaleup development where speed and AI leverage are competitive advantages.

## Project Structure

```text
customer-support-ai/
├── frontend/                  # React + Vite UI
│   └── src/
│       ├── App.tsx            # Main dashboard
│       ├── api/
│       │   └── triage.ts      # Backend API client
│       └── index.css          # Styling
│   └── package.json
├── backend/                   # Express API
│   └── src/
│       ├── server.ts          # Entry point
│       ├── triage.ts          # AI triage logic
│       └── types.ts           # Shared types
│   └── package.json
├── db/                        # Database layer (reserved)
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key (or Gemini API key)

### Backend

```bash
cd backend
npm install

# Create .env from .env.example
cp .env.example .env
# Add your OPENAI_API_KEY to .env

npm run dev
# Server runs on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# UI runs on http://localhost:5173
```

## Example Workflow

### Input

```bash
Customer: "I can't log in to my account and I need access right now."
```

### AI Output

```bash
{
  "category": "Account Access",
  "severity": "high",
  "summary": "Customer unable to authenticate; urgent access required.",
  "draftEmail": "Hello,\n\nThank you for reaching out. We understand how frustrating login issues can be. Our team is looking into this immediately.\n\nIn the meantime, try resetting your password...",
  "provider": "openai"
}
```

### Dashboard Display

- Category badge: Account Access
- Severity indicator: HIGH (red)
- Suggested reply visible for agent review and editing

## Configuration

### Create backend/.env

```bash
PORT=3001
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

### Switch providers without code changes

```bash
# Use Gemini instead
AI_PROVIDER=gemini
```

## Key Features 

- Plug-and-play AI providers — Support multiple LLM backends
- Type-safe end-to-end — TypeScript on both frontend and backend
- Structured outputs — Deterministic JSON responses for integration
- Fallback behavior — Graceful degradation if AI service is unavailable
- Fast dev iteration — Hot reload on both frontend and backend

## Roadmap

 - Ticket persistence (PostgreSQL)
 - Agent authentication and audit logs
 - Ticket history and analytics dashboard
 - Multi-language support
 - Custom triage rules engine
 - Deployment (Vercel + Cloud Run / Railway)
 - Fine-tuned model option for higher accuracy

## Performance & Cost Notes

- Model selection: gpt-4o-mini chosen for cost-efficiency (~$0.15 / 1M input tokens) while maintaining quality
- Response time: ~1-2 seconds per triage (including API latency)
- Estimated cost: ~$0.001 per ticket with default model

## What This Demonstrates

### For a Support Engineer / AI Engineer role

- Hands-on AI API integration and provider abstraction
- Full-stack thinking (frontend, backend, AI layer)
- Pragmatic architecture decisions
- Real-time workflow automation
- Type safety and developer experience
- Fast prototyping mindset

## License

MIT


Built with ❤️ and GitHub Copilot