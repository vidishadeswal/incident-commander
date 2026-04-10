from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.ai_artifact import AIArtifact
from app.models.event import Event
from app.models.incident import Incident
from app.schemas.ai import (
    Hypothesis,
    IncidentAnalysisResponse,
    PostmortemResponse,
    StatusDraftResponse,
)
from app.services.llm_client import LLMClient
from app.services.prompt_service import PromptService


class AIService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.llm = LLMClient()
        self.prompts = PromptService()

    def analyze_incident(self, incident_id: int) -> IncidentAnalysisResponse | None:
        incident = self.db.get(Incident, incident_id)
        if not incident:
            return None
        events = self._incident_events(incident_id)
        system, user = self.prompts.incident_analysis_prompt(incident, events)
        raw = self.llm.generate(system, user)

        hypotheses = self._deterministic_hypotheses(events)
        internal_update = self._persist_artifact(
            incident_id=incident_id,
            artifact_type="analysis",
            audience="internal",
            content=raw,
            confidence=max((item.confidence for item in hypotheses), default=0.4),
        )

        return IncidentAnalysisResponse(
            summary=self._first_paragraph(raw),
            impacted_services=sorted({event.service for event in events if event.service}),
            hypotheses=hypotheses,
            internal_update=internal_update.content,
        )

    def draft_status_update(self, incident_id: int, audience: str) -> StatusDraftResponse | None:
        incident = self.db.get(Incident, incident_id)
        if not incident:
            return None
        events = self._incident_events(incident_id)
        system, user = self.prompts.status_draft_prompt(incident, audience, events)
        content = self.llm.generate(system, user)
        artifact = self._persist_artifact(
            incident_id=incident_id,
            artifact_type="status_update",
            audience=audience,
            content=content,
            confidence=0.65,
        )
        return StatusDraftResponse(
            audience=artifact.audience,
            content=artifact.content,
            confidence=artifact.confidence,
        )

    def draft_postmortem(self, incident_id: int) -> PostmortemResponse | None:
        incident = self.db.get(Incident, incident_id)
        if not incident:
            return None
        events = self._incident_events(incident_id)
        system, user = self.prompts.postmortem_prompt(incident, events)
        content = self.llm.generate(system, user)
        artifact = self._persist_artifact(
            incident_id=incident_id,
            artifact_type="postmortem",
            audience="internal",
            content=content,
            confidence=0.6,
        )
        return PostmortemResponse(content=artifact.content, confidence=artifact.confidence)

    def _incident_events(self, incident_id: int) -> list[Event]:
        query = (
            select(Event)
            .where(Event.incident_id == incident_id)
            .order_by(Event.timestamp.asc())
            .limit(settings.max_context_events)
        )
        return list(self.db.scalars(query))

    def _persist_artifact(
        self,
        incident_id: int,
        artifact_type: str,
        audience: str,
        content: str,
        confidence: float,
    ) -> AIArtifact:
        artifact = AIArtifact(
            incident_id=incident_id,
            artifact_type=artifact_type,
            audience=audience,
            content=content,
            confidence=confidence,
            metadata_json={},
        )
        self.db.add(artifact)
        self.db.commit()
        self.db.refresh(artifact)
        return artifact

    def _first_paragraph(self, content: str) -> str:
        return content.split("\n\n")[0].strip() or "Incident analysis unavailable."

    def _deterministic_hypotheses(self, events: list[Event]) -> list[Hypothesis]:
        hypotheses: list[Hypothesis] = []
        deploy_events = [event for event in events if event.event_type in {"deploy", "release"}]
        db_events = [event for event in events if "db" in event.body.lower() or "database" in event.body.lower()]
        error_events = [event for event in events if event.severity.lower() in {"error", "critical"}]

        if deploy_events:
            hypotheses.append(
                Hypothesis(
                    summary="A recent deploy may have introduced the regression.",
                    confidence=0.68,
                    evidence=[item.title for item in deploy_events[-2:]],
                    next_checks=[
                        "Compare the latest deploy against the previous stable release.",
                        "Consider rollback if error rate is still rising.",
                    ],
                )
            )
        if db_events:
            hypotheses.append(
                Hypothesis(
                    summary="Database latency or connection pressure may be amplifying failures.",
                    confidence=0.63,
                    evidence=[item.body[:120] for item in db_events[-2:]],
                    next_checks=[
                        "Inspect connection pool saturation and slow queries.",
                        "Check whether recent deploys changed query patterns.",
                    ],
                )
            )
        if error_events and not hypotheses:
            hypotheses.append(
                Hypothesis(
                    summary="Application errors are increasing without a single confirmed cause yet.",
                    confidence=0.45,
                    evidence=[item.title for item in error_events[-3:]],
                    next_checks=[
                        "Cluster failing requests by endpoint and service.",
                        "Compare the spike with recent deploys, infra changes, and dependency health.",
                    ],
                )
            )
        if not hypotheses:
            hypotheses.append(
                Hypothesis(
                    summary="More evidence is needed before naming a likely root cause.",
                    confidence=0.2,
                    evidence=["Limited incident context available."],
                    next_checks=[
                        "Add logs, alerts, and recent deployment events.",
                        "Capture customer impact and affected services.",
                    ],
                )
            )
        return hypotheses[:3]

