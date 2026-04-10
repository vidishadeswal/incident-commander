from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.incident import Incident, IncidentStatus
from app.schemas.incident import IncidentCreate, IncidentUpdate


class IncidentService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_incidents(self) -> list[Incident]:
        return list(self.db.scalars(select(Incident).order_by(Incident.started_at.desc())))

    def get_incident(self, incident_id: int) -> Incident | None:
        return self.db.get(Incident, incident_id)

    def create_incident(self, payload: IncidentCreate) -> Incident:
        incident = Incident(**payload.model_dump())
        self.db.add(incident)
        self.db.commit()
        self.db.refresh(incident)
        return incident

    def update_incident(self, incident_id: int, payload: IncidentUpdate) -> Incident | None:
        incident = self.db.get(Incident, incident_id)
        if not incident:
            return None
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(incident, field, value)
        if incident.status == IncidentStatus.resolved and incident.resolved_at is None:
            setattr(incident, "resolved_at", incident.updated_at)
        self.db.add(incident)
        self.db.commit()
        self.db.refresh(incident)
        return incident

