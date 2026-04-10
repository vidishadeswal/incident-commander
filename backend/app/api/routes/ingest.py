from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.config import settings
from app.schemas.ingest import AlertIngestRequest, GitHubIngestRequest, LogIngestRequest
from app.services.ingestion_service import IngestionService

router = APIRouter(prefix="/ingest", tags=["ingestion"])


@router.post("/alerts")
def ingest_alert(
    payload: AlertIngestRequest,
    db: Session = Depends(get_db),
    x_alert_secret: str | None = Header(default=None),
) -> dict[str, object]:
    if settings.alert_webhook_secret and x_alert_secret != settings.alert_webhook_secret:
        raise HTTPException(status_code=401, detail="Invalid alert secret")
    incident = IngestionService(db).ingest_alert(payload)
    return {"ok": True, "incident_id": incident.id}


@router.post("/logs")
def ingest_logs(payload: LogIngestRequest, db: Session = Depends(get_db)) -> dict[str, object]:
    result = IngestionService(db).ingest_logs(payload)
    return {"ok": True, "incident_id": result["incident_id"], "events_created": result["count"]}


@router.post("/github")
def ingest_github(
    payload: GitHubIngestRequest,
    db: Session = Depends(get_db),
    x_github_secret: str | None = Header(default=None),
) -> dict[str, object]:
    if settings.github_webhook_secret and x_github_secret != settings.github_webhook_secret:
        raise HTTPException(status_code=401, detail="Invalid GitHub secret")
    event = IngestionService(db).ingest_github(payload)
    return {"ok": True, "incident_id": event.incident_id, "event_id": event.id}

