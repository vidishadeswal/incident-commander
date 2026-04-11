"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiRequest, toLocalDateTime } from "../../lib/api";
import { Incident, IncidentSeverity, IncidentStatus } from "../../lib/types";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    "Manage incidents and keep status fresh.",
  );

  const [createForm, setCreateForm] = useState({
    title: "Checkout latency spike",
    description: "Customers report delayed checkout responses.",
    severity: "sev2" as IncidentSeverity,
    service: "checkout",
    source: "manual",
    impact_summary: "Some users cannot complete orders.",
  });

  const [nextStatus, setNextStatus] = useState<IncidentStatus>("investigating");

  const selectedIncident = useMemo(
    () => incidents.find((incident) => incident.id === selectedId) ?? null,
    [incidents, selectedId],
  );

  async function refreshIncidents(preferredId?: number): Promise<void> {
    setBusy(true);
    setError("");
    try {
      const data = await apiRequest<Incident[]>("/incidents");
      setIncidents(data);
      if (typeof preferredId === "number") {
        setSelectedId(preferredId);
      } else if (data.length > 0 && selectedId === null) {
        setSelectedId(data[0].id);
      } else if (selectedId && !data.some((item) => item.id === selectedId)) {
        setSelectedId(data[0]?.id ?? null);
      }
      setNotice(`Loaded ${data.length} incident(s)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load incidents");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void refreshIncidents();
  }, []);

  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const created = await apiRequest<Incident>("/incidents", {
        method: "POST",
        body: JSON.stringify(createForm),
      });
      await refreshIncidents(created.id);
      setNotice(`Created incident #${created.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create incident",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusUpdate(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (!selectedIncident) {
      setError("Pick an incident first");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await apiRequest<Incident>(`/incidents/${selectedIncident.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      await refreshIncidents(selectedIncident.id);
      setNotice(`Incident #${selectedIncident.id} set to ${nextStatus}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page shellGrid">
      <section className="pageIntro">
        <p className="eyebrow">Incidents</p>
        <h1>Incident Operations Center</h1>
        <p style={{ fontSize: '1.5rem' }}>
          Real-time incident management for high-availability systems. 
          Monitor, investigate, and resolve production blockers with full context.
        </p>
        <div className="statusRow" style={{ marginTop: '2.5rem' }}>
          <span className="pill neutral" style={{ padding: '10px 20px', fontSize: '1rem' }}>{busy ? "Working..." : notice}</span>
          <button
            className="ghostButton"
            style={{ minWidth: '150px' }}
            type="button"
            onClick={() => void refreshIncidents(selectedId ?? undefined)}
          >
            Refresh Hub
          </button>
        </div>
        {error ? <p className="error" style={{ marginTop: '2rem' }}>{error}</p> : null}
      </section>

      <section className="splitPane">
        <article className="panelBox">
          <h2 style={{ marginBottom: '3rem' }}>Active Incidents</h2>
          <div className="listStack">
            {incidents.length === 0 ? (
              <p className="muted">No incidents in the stream.</p>
            ) : null}
            {incidents.map((incident) => (
              <button
                key={incident.id}
                type="button"
                className={`listItem ${incident.id === selectedId ? "active" : ""}`}
                onClick={() => setSelectedId(incident.id)}
              >
                <strong>
                  #{incident.id} {incident.title}
                </strong>
                <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <span className="pill" style={{ background: 'rgba(0,0,0,0.3)' }}>{incident.service}</span>
                    <span className="pill" style={{ background: incident.severity === 'sev1' ? 'var(--error)' : 'rgba(255,255,255,0.1)', color: incident.severity === 'sev1' ? '#000' : 'inherit' }}>
                        {incident.severity.toUpperCase()}
                    </span>
                    <span className="pill" style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}>{incident.status}</span>
                </div>
                <span style={{ marginTop: '0.5rem', opacity: 0.6 }}>Investigation started: {toLocalDateTime(incident.started_at)}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="panelBox">
          <form className="formBlock" onSubmit={handleCreate}>
            <h2 style={{ marginBottom: '3rem' }}>Initialize New Incident</h2>
            <label data-tooltip="Enter a clear, concise title for the incident (e.g., 'Database Connection Timeout')">
              Title
              <input
                required
                placeholder="Checkout latency spike"
                value={createForm.title}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <label data-tooltip="Provide a detailed description of the observed behavior and any initial findings.">
              Description
              <textarea
                placeholder="Customers report delayed checkout responses..."
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </label>
            <div className="inlineGrid" style={{ gap: '2rem' }}>
              <label data-tooltip="SEV1 is critical/outage, SEV4 is minor/informational.">
                Severity
                <select
                  value={createForm.severity}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      severity: event.target.value as IncidentSeverity,
                    }))
                  }
                >
                  <option value="sev1">SEV1 - Critical Outage</option>
                  <option value="sev2">SEV2 - High Impact</option>
                  <option value="sev3">SEV3 - Medium Impact</option>
                  <option value="sev4">SEV4 - Low Impact</option>
                </select>
              </label>
              <label data-tooltip="The primary microservice or system affected by this incident.">
                Service
                <input
                  placeholder="e.g. checkout-api"
                  value={createForm.service}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      service: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label data-tooltip="A brief summary of how this incident affects customers or business operations.">
              Impact Summary
              <input
                placeholder="Some users cannot complete orders"
                value={createForm.impact_summary}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    impact_summary: event.target.value,
                  }))
                }
              />
            </label>
            <button type="submit" className="ctaButton" style={{ marginTop: '2rem', width: '100%', maxWidth: 'none' }}>
                Open Incident
            </button>
          </form>

          <div style={{ margin: '4rem 0', height: '1px', background: 'var(--border)' }} />

          <form className="formBlock" onSubmit={handleStatusUpdate}>
            <h2 style={{ marginBottom: '3rem' }}>Lifecycle Management</h2>
            <p className="muted" style={{ marginBottom: '1.5rem' }}>
              {selectedIncident
                ? `Active Focus: Incident #${selectedIncident.id}`
                : "Select an incident from the stream to manage its status."}
            </p>
            <label data-tooltip="Transition the incident through its lifecycle stages.">
              New Operational Status
              <select
                value={nextStatus}
                onChange={(event) =>
                  setNextStatus(event.target.value as IncidentStatus)
                }
              >
                <option value="open">Open (Identified)</option>
                <option value="investigating">Investigating (Diagnosing)</option>
                <option value="mitigated">Mitigated (Impact Cleared)</option>
                <option value="resolved">Resolved (Permanent Fix)</option>
              </select>
            </label>
            <button type="submit" className="ctaButton" disabled={!selectedIncident} style={{ marginTop: '2rem', width: '100%', maxWidth: 'none' }}>
              Update Lifecycle Stage
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}
