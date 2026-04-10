"use client";

import { useEffect, useState } from "react";
import { apiRequest, toLocalDateTime } from "../../lib/api";
import { Incident, TimelineEntry, TimelineResponse } from "../../lib/types";

export default function TimelinePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    "Timeline combines all normalized incident events.",
  );

  async function refreshIncidents(preferId?: number): Promise<void> {
    try {
      const data = await apiRequest<Incident[]>("/incidents");
      setIncidents(data);
      if (typeof preferId === "number") {
        setSelectedId(preferId);
      } else if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load incidents");
    }
  }

  async function loadTimeline(incidentId: number): Promise<void> {
    setBusy(true);
    setError("");
    try {
      const data = await apiRequest<TimelineResponse>(
        `/timeline/${incidentId}`,
      );
      setTimeline(data.entries);
      setNotice(`Timeline rebuilt with ${data.entries.length} entries.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load timeline");
      setTimeline([]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void refreshIncidents();
  }, []);

  useEffect(() => {
    if (selectedId) {
      void loadTimeline(selectedId);
    }
  }, [selectedId]);

  return (
    <main className="page shellGrid">
      <section className="pageIntro">
        <p className="eyebrow">Timeline</p>
        <h1>View incident chronology and confidence markers</h1>
        <p>
          This page rebuilds timeline entries from normalized incident events.
          It helps teams see what happened, in order, with deterministic
          categories.
        </p>
        <div className="statusRow">
          <span className="pill neutral">{busy ? "Working..." : notice}</span>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="featureGrid twoCols">
        <article className="panelBox">
          <h2>Incident Selector</h2>
          <label data-tooltip="Select the incident you want to generate a chronological timeline for.">
            Incident
            <select
              value={selectedId ?? ""}
              onChange={(event) =>
                setSelectedId(
                  event.target.value ? Number(event.target.value) : null,
                )
              }
            >
              <option value="">Select an incident</option>
              {incidents.map((incident) => (
                <option key={incident.id} value={incident.id}>
                  #{incident.id} {incident.title}
                </option>
              ))}
            </select>
          </label>
          <div className="inlineActions">
            <button
              type="button"
              onClick={() => void refreshIncidents(selectedId ?? undefined)}
            >
              Refresh Incidents
            </button>
            <button
              type="button"
              onClick={() => selectedId && void loadTimeline(selectedId)}
              disabled={!selectedId}
            >
              Rebuild Timeline
            </button>
          </div>
        </article>

        <article className="panelBox">
          <h2>Timeline Entries</h2>
          {timeline.length === 0 ? (
            <p className="muted">No timeline entries yet.</p>
          ) : null}
          <div className="timelineStack">
            {timeline.map((entry, index) => (
              <div key={`${entry.timestamp}-${index}`} className="timelineCard">
                <p className="metaText">
                  <strong>{entry.category}</strong> ·{" "}
                  {toLocalDateTime(entry.timestamp)} · confidence{" "}
                  {entry.confidence.toFixed(2)}
                </p>
                <p className="timelineSummary">{entry.summary}</p>
                <p>{entry.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
