from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.incident import IncidentSeverity, IncidentStatus


class IncidentBase(BaseModel):
    title: str
    description: str = ""
    severity: IncidentSeverity = IncidentSeverity.sev3
    service: str = "unknown"
    source: str = "manual"
    impact_summary: str = ""


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    severity: IncidentSeverity | None = None
    status: IncidentStatus | None = None
    service: str | None = None
    impact_summary: str | None = None
    confidence_score: float | None = None
    resolved_at: datetime | None = None


class IncidentRead(IncidentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: IncidentStatus
    confidence_score: float
    started_at: datetime
    resolved_at: datetime | None
    created_at: datetime
    updated_at: datetime

