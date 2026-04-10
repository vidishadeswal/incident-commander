from datetime import datetime

from pydantic import BaseModel

from app.schemas.incident import IncidentRead


class TimelineEntryRead(BaseModel):
    timestamp: datetime
    summary: str
    detail: str
    category: str
    confidence: float
    metadata_json: dict


class TimelineResponse(BaseModel):
    incident: IncidentRead
    entries: list[TimelineEntryRead]

