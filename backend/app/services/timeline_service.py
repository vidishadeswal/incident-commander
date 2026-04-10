from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.incident import Incident
from app.models.timeline_entry import TimelineEntry
from app.schemas.timeline import TimelineEntryRead, TimelineResponse


class TimelineService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def build_timeline(self, incident_id: int) -> TimelineResponse | None:
        incident = self.db.get(Incident, incident_id)
        if not incident:
            return None

        events = list(
            self.db.scalars(
                select(Event).where(Event.incident_id == incident_id).order_by(Event.timestamp.asc())
            )
        )
        self.db.execute(delete(TimelineEntry).where(TimelineEntry.incident_id == incident_id))

        entries: list[TimelineEntry] = []
        for event in events:
            category = self._category_for_event(event.event_type, event.severity)
            entries.append(
                TimelineEntry(
                    incident_id=incident_id,
                    timestamp=event.timestamp,
                    summary=self._summary_for_event(event),
                    detail=event.body,
                    category=category,
                    confidence=1.0 if category != "hypothesis" else 0.6,
                    metadata_json=event.metadata_json,
                )
            )

        for entry in entries:
            self.db.add(entry)
        self.db.commit()

        saved_entries = list(
            self.db.scalars(
                select(TimelineEntry)
                .where(TimelineEntry.incident_id == incident_id)
                .order_by(TimelineEntry.timestamp.asc())
            )
        )

        return TimelineResponse(
            incident=incident,
            entries=[
                TimelineEntryRead(
                    timestamp=item.timestamp,
                    summary=item.summary,
                    detail=item.detail,
                    category=item.category,
                    confidence=item.confidence,
                    metadata_json=item.metadata_json,
                )
                for item in saved_entries
            ],
        )

    def _category_for_event(self, event_type: str, severity: str) -> str:
        if event_type == "alert_triggered":
            return "alert"
        if event_type in {"deploy", "release", "rollback"}:
            return "deploy"
        if severity.lower() in {"error", "critical"}:
            return "error"
        if event_type.startswith("issue"):
            return "issue"
        return "signal"

    def _summary_for_event(self, event: Event) -> str:
        if event.event_type == "alert_triggered":
            return f"Alert fired for {event.service}"
        if event.event_type == "log_line":
            return f"{event.service} emitted {event.severity} logs"
        if event.source == "github":
            return f"GitHub {event.event_type} in {event.metadata_json.get('repository', 'repo')}"
        return event.title

