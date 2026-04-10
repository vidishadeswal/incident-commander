# Backend

FastAPI backend for AI Incident Commander.

## Responsibilities

- ingest incident signals
- normalize events across sources
- manage incidents and timelines
- request AI summaries and RCA hypotheses
- generate status updates and postmortem drafts

## Run locally

1. Copy `.env.example` to `.env`
2. Start services:

```bash
docker compose up --build
```

Or run only the API locally:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## What you need to fill in

- `DATABASE_URL`
- `GITHUB_TOKEN`
- `GITHUB_WEBHOOK_SECRET`
- `ALERT_WEBHOOK_SECRET`
- `LLM_BASE_URL`
- `LLM_MODEL`

## API areas

- `/api/v1/health`
- `/api/v1/incidents`
- `/api/v1/ingest`
- `/api/v1/timeline`
- `/api/v1/ai`

