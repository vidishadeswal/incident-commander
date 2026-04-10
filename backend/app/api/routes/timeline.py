from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.timeline import TimelineResponse
from app.services.timeline_service import TimelineService

router = APIRouter(prefix="/timeline", tags=["timeline"])


@router.get("/{incident_id}", response_model=TimelineResponse)
def get_timeline(incident_id: int, db: Session = Depends(get_db)) -> TimelineResponse:
    timeline = TimelineService(db).build_timeline(incident_id)
    if timeline is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return timeline

