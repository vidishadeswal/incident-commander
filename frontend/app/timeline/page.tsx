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
        <h1>Deterministic Evidence Chain</h1>
        <p style={{ fontSize: '1.5rem' }}>
          Automatically reconstruct the sequence of events from normalized signals. 
          Identify the exact moment of regression with confidence-scored evidence.
        </p>
        <div className="statusRow" style={{ marginTop: '2.5rem' }}>
          <span className="pill neutral" style={{ padding: '10px 20px', fontSize: '1rem' }}>{busy ? "Rebuilding..." : notice}</span>
        </div>
        {error ? <p className="error" style={{ marginTop: '2rem' }}>{error}</p> : null}
      </section>

      <section className="splitPane">
        <article className="panelBox">
          <h2 style={{ marginBottom: '3rem' }}>Incident Scope</h2>
          <label data-tooltip="Select the incident you want to generate a chronological timeline for.">
            Active Incident
            <select
              style={{ marginTop: '1rem' }}
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
          <div className="inlineActions" style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', flexDirection: 'column' }}>
            <button
              className="ghostButton"
              style={{ width: '100%' }}
              type="button"
              onClick={() => void refreshIncidents(selectedId ?? undefined)}
            >
              Sync Incidents
            </button>
            <button
              className="ctaButton"
              style={{ width: '100%', maxWidth: 'none' }}
              type="button"
              onClick={() => selectedId && void loadTimeline(selectedId)}
              disabled={!selectedId}
            >
              Reconstruct Timeline
            </button>
          </div>
        </article>

        <article className="panelBox">
          <h2 style={{ marginBottom: '3rem' }}>Visual Chronology</h2>
          {timeline.length === 0 ? (
            <p className="muted">No evidence captured for this incident yet. Use the Ingestion module to push signals.</p>
          ) : (
            <div className="timelineGraph">
              <div className="timelineLine" />
              {timeline.map((entry, index) => (
                <div key={`${entry.timestamp}-${index}`} className="timelineVisualEntry">
                  <div className="timeColumn">
                    <strong style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </strong>
                  </div>
                  <div className="contentColumn">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="pill" style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--accent)', fontSize: '0.8rem' }}>{entry.category.toUpperCase()}</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Conf: {(entry.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>{entry.summary}</h3>
                    <p style={{ fontSize: '1rem' }}>{entry.detail}</p>
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.4 }}>{toLocalDateTime(entry.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
