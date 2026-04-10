from datetime import datetime

from pydantic import BaseModel, Field


class AlertIngestRequest(BaseModel):
    title: str
    description: str = ""
    severity: str = "critical"
    service: str = "unknown"
    source: str = "alertmanager"
    timestamp: datetime
    metadata: dict = Field(default_factory=dict)


class LogLine(BaseModel):
    timestamp: datetime
    level: str = "info"
    message: str
    service: str = "unknown"
    trace_id: str = ""
    metadata: dict = Field(default_factory=dict)


class LogIngestRequest(BaseModel):
    incident_id: int | None = None
    service: str = "unknown"
    source: str = "logs"
    logs: list[LogLine]


class GitHubIngestRequest(BaseModel):
    incident_id: int | None = None
    event_type: str
    repository: str
    title: str
    body: str = ""
    actor: str = "github"
    service: str = "unknown"
    timestamp: datetime
    reference_id: str = ""
    metadata: dict = Field(default_factory=dict)

