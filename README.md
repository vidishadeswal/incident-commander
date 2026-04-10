# AI Incident Commander

AI Incident Commander is a production-incident assistant that ingests alerts, logs, and GitHub activity to build live incident timelines, suggest likely root causes, and draft status updates.

## Structure

- `backend/` FastAPI API, incident engine, local LLM integration, persistence
- `frontend/` Next.js app shell for dashboard and incident workspace UI

## MVP scope

- Incident and event management
- Generic alert ingestion
- Log ingestion
- GitHub issue/deploy ingestion
- Deterministic incident timeline generation
- AI-generated incident summaries, RCA hypotheses, and status drafts
- Incident history and postmortem draft generation

## Local development

See:

- `backend/README.md`
- `frontend/README.md`

