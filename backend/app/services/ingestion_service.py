from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.incident import Incident
from app.schemas.ingest import AlertIngestRequest, GitHubIngestRequest, LogIngestRequest
from app.services.normalization_service import NormalizationService
from app.services.timeline_service import TimelineService


class IngestionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.normalizer = NormalizationService()

    def ingest_alert(self, payload: AlertIngestRequest) -> Incident:
        incident = self.normalizer.normalize_alert_to_incident(payload)
        self.db.add(incident)
        self.db.commit()
        self.db.refresh(incident)

        alert_event = self.normalizer.normalize_alert_to_event(incident.id, payload)
        self.db.add(alert_event)
        self.db.commit()

        TimelineService(self.db).build_timeline(incident.id)
        return incident

    def ingest_logs(self, payload: LogIngestRequest) -> dict[str, int]:
        incident_id = payload.incident_id or self._create_log_seed_incident(payload.service).id
        created = 0

        for log in payload.logs:
            event = self.normalizer.normalize_log(incident_id, payload.source, log)
            self.db.add(event)
            created += 1

        self.db.commit()
        TimelineService(self.db).build_timeline(incident_id)
        return {"incident_id": incident_id, "count": created}

    def ingest_github(self, payload: GitHubIngestRequest) -> Event:
        incident_id = payload.incident_id or self._create_github_seed_incident(payload.service, payload.title).id
        event = self.normalizer.normalize_github_event(incident_id, payload)
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        TimelineService(self.db).build_timeline(incident_id)
        return event

    def _create_log_seed_incident(self, service: str) -> Incident:
        incident = Incident(
            title=f"Incident detected for {service}",
            description="Created from log ingestion",
            service=service,
            source="logs",
            started_at=datetime.now(UTC),
        )
        self.db.add(incident)
        self.db.commit()
        self.db.refresh(incident)
        return incident

    def _create_github_seed_incident(self, service: str, title: str) -> Incident:
        incident = Incident(
            title=title,
            description="Created from GitHub event ingestion",
            service=service,
            source="github",
            started_at=datetime.now(UTC),
        )
        self.db.add(incident)
        self.db.commit()
        self.db.refresh(incident)
        return incident

