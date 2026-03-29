# ArthaAI Indian Investor Intelligence Layer

Production-grade AI platform scaffold for Indian stock market intelligence.

## Services

- `backend`: Express API with clean architecture, validation, Winston logging, Redis/Kafka/Mongo integration points, and Jest tests.
- `ai-services`: FastAPI service for market insight generation and signal scoring with pytest tests.
- `frontend`: Next.js + Tailwind dashboard for market overview and AI chat.
- `docs`: API contracts and architecture notes.

## Quick Start

### Backend

```bash
cd backend
npm install
npm run dev
```

### AI Service

```bash
cd ai-services
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment

Copy the example files before running:

- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env.local`
- `ai-services/.env.example` -> `ai-services/.env`

## Architecture

- Controllers handle HTTP concerns.
- Services hold orchestration and business logic.
- Repositories encapsulate persistence.
- Validators centralize request safety.
- Shared middleware provides error handling and structured logging.
