from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.ai import (
    IncidentAnalysisResponse,
    PostmortemResponse,
    StatusDraftRequest,
    StatusDraftResponse,
)
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/incidents/{incident_id}/analysis", response_model=IncidentAnalysisResponse)
def analyze_incident(incident_id: int, db: Session = Depends(get_db)) -> IncidentAnalysisResponse:
    result = AIService(db).analyze_incident(incident_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return result


@router.post("/incidents/{incident_id}/status-draft", response_model=StatusDraftResponse)
def draft_status_update(
    incident_id: int,
    payload: StatusDraftRequest,
    db: Session = Depends(get_db),
) -> StatusDraftResponse:
    result = AIService(db).draft_status_update(incident_id, payload.audience)
    if result is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return result


@router.get("/incidents/{incident_id}/postmortem", response_model=PostmortemResponse)
def draft_postmortem(incident_id: int, db: Session = Depends(get_db)) -> PostmortemResponse:
    result = AIService(db).draft_postmortem(incident_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return result

