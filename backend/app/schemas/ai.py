from pydantic import BaseModel


class Hypothesis(BaseModel):
    summary: str
    confidence: float
    evidence: list[str]
    next_checks: list[str]


class IncidentAnalysisResponse(BaseModel):
    summary: str
    impacted_services: list[str]
    hypotheses: list[Hypothesis]
    internal_update: str


class StatusDraftRequest(BaseModel):
    audience: str = "internal"


class StatusDraftResponse(BaseModel):
    audience: str
    content: str
    confidence: float


class PostmortemResponse(BaseModel):
    content: str
    confidence: float

