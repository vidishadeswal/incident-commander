from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SqlEnum, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class IncidentStatus(str, Enum):
    open = "open"
    investigating = "investigating"
    mitigated = "mitigated"
    resolved = "resolved"


class IncidentSeverity(str, Enum):
    sev1 = "sev1"
    sev2 = "sev2"
    sev3 = "sev3"
    sev4 = "sev4"


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[IncidentStatus] = mapped_column(
        SqlEnum(IncidentStatus),
        default=IncidentStatus.open,
        nullable=False,
    )
    severity: Mapped[IncidentSeverity] = mapped_column(
        SqlEnum(IncidentSeverity),
        default=IncidentSeverity.sev3,
        nullable=False,
    )
    service: Mapped[str] = mapped_column(String(120), default="unknown")
    source: Mapped[str] = mapped_column(String(50), default="manual")
    impact_summary: Mapped[str] = mapped_column(Text, default="")
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        onupdate=func.now(),
    )

    events = relationship("Event", back_populates="incident", cascade="all, delete-orphan")
    timeline_entries = relationship(
        "TimelineEntry",
        back_populates="incident",
        cascade="all, delete-orphan",
    )
    ai_artifacts = relationship(
        "AIArtifact",
        back_populates="incident",
        cascade="all, delete-orphan",
    )

