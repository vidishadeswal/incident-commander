from app.models.event import Event
from app.models.incident import Incident


class PromptService:
    def incident_analysis_prompt(self, incident: Incident, events: list[Event]) -> tuple[str, str]:
        event_lines = "\n".join(
            f"- {event.timestamp.isoformat()} | {event.source} | {event.event_type} | "
            f"{event.service} | {event.severity} | {event.title} | {event.body[:240]}"
            for event in events
        )
        system = (
            "You are an incident response assistant. Be cautious, evidence-based, and explicit about "
            "uncertainty. Never claim certainty without strong evidence."
        )
        user = (
            f"Incident title: {incident.title}\n"
            f"Description: {incident.description}\n"
            f"Severity: {incident.severity.value}\n"
            f"Service: {incident.service}\n\n"
            "Analyze the incident and produce:\n"
            "1. A short summary\n"
            "2. Likely impacted services\n"
            "3. Up to 3 root-cause hypotheses with confidence, evidence, and next checks\n"
            "4. A short internal engineering update\n\n"
            f"Events:\n{event_lines}"
        )
        return system, user

    def status_draft_prompt(self, incident: Incident, audience: str, events: list[Event]) -> tuple[str, str]:
        system = "You draft concise and careful incident status updates."
        facts = "\n".join(f"- {event.timestamp.isoformat()} {event.title}" for event in events)
        user = (
            f"Audience: {audience}\n"
            f"Incident: {incident.title}\n"
            f"Service: {incident.service}\n"
            f"Status: {incident.status.value}\n"
            "Write a short status update that is calm, factual, and avoids overclaiming.\n"
            f"Facts:\n{facts}"
        )
        return system, user

    def postmortem_prompt(self, incident: Incident, events: list[Event]) -> tuple[str, str]:
        system = "You create postmortem drafts from incident timelines."
        facts = "\n".join(
            f"- {event.timestamp.isoformat()} | {event.event_type} | {event.title} | {event.body[:160]}"
            for event in events
        )
        user = (
            f"Create a postmortem draft for incident '{incident.title}'. Include sections for summary, "
            "impact, timeline, likely root cause, mitigation, and follow-up actions.\n"
            f"Timeline facts:\n{facts}"
        )
        return system, user

