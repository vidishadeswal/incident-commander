from app.models.event import Event
from app.models.incident import Incident, IncidentSeverity
from app.schemas.ingest import AlertIngestRequest, GitHubIngestRequest, LogLine


class NormalizationService:
    severity_map = {
        "critical": IncidentSeverity.sev1,
        "high": IncidentSeverity.sev2,
        "warning": IncidentSeverity.sev3,
        "info": IncidentSeverity.sev4,
        "error": IncidentSeverity.sev2,
    }

    def normalize_alert_to_incident(self, payload: AlertIngestRequest) -> Incident:
        return Incident(
            title=payload.title,
            description=payload.description,
            severity=self.severity_map.get(payload.severity.lower(), IncidentSeverity.sev3),
            service=payload.service,
            source=payload.source,
            impact_summary=payload.metadata.get("impact_summary", ""),
            confidence_score=0.4,
            started_at=payload.timestamp,
        )

    def normalize_alert_to_event(self, incident_id: int, payload: AlertIngestRequest) -> Event:
        return Event(
            incident_id=incident_id,
            source=payload.source,
            event_type="alert_triggered",
            service=payload.service,
            severity=payload.severity,
            title=payload.title,
            body=payload.description,
            timestamp=payload.timestamp,
            actor="alert-system",
            metadata_json=payload.metadata,
        )

    def normalize_log(self, incident_id: int, source: str, log: LogLine) -> Event:
        return Event(
            incident_id=incident_id,
            source=source,
            event_type="log_line",
            service=log.service,
            severity=log.level,
            title=f"{log.service} log event",
            body=log.message,
            timestamp=log.timestamp,
            actor="log-ingestor",
            reference_id=log.trace_id,
            metadata_json=log.metadata,
        )

    def normalize_github_event(self, incident_id: int, payload: GitHubIngestRequest) -> Event:
        return Event(
            incident_id=incident_id,
            source="github",
            event_type=payload.event_type,
            service=payload.service,
            severity=payload.metadata.get("severity", "info"),
            title=payload.title,
            body=payload.body,
            timestamp=payload.timestamp,
            actor=payload.actor,
            reference_id=payload.reference_id,
            metadata_json={"repository": payload.repository, **payload.metadata},
        )

