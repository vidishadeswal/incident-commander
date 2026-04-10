"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type IncidentStatus = "open" | "investigating" | "mitigated" | "resolved";
type IncidentSeverity = "sev1" | "sev2" | "sev3" | "sev4";

type Incident = {
  id: number;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  service: string;
  source: string;
  impact_summary: string;
  confidence_score: number;
  started_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

type TimelineEntry = {
  timestamp: string;
  summary: string;
  detail: string;
  category: string;
  confidence: number;
  metadata_json: Record<string, unknown>;
};

type TimelineResponse = {
  incident: Incident;
  entries: TimelineEntry[];
};

type Hypothesis = {
  summary: string;
  confidence: number;
  evidence: string[];
  next_checks: string[];
};

type AnalysisResponse = {
  summary: string;
  impacted_services: string[];
  hypotheses: Hypothesis[];
  internal_update: string;
};

type StatusDraftResponse = {
  audience: string;
  content: string;
  confidence: number;
};

type PostmortemResponse = {
  content: string;
  confidence: number;
};

const API_BASE = "/api/backend/api/v1";

function nowIso(): string {
  return new Date().toISOString();
}

function toLocalDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail =
      typeof body === "object" && body && "detail" in body
        ? String((body as { detail?: string }).detail)
        : response.statusText;
    throw new Error(`${response.status} ${detail}`);
  }

  return body as T;
}

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(
    null,
  );
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [statusDraft, setStatusDraft] = useState<StatusDraftResponse | null>(
    null,
  );
  const [postmortem, setPostmortem] = useState<PostmortemResponse | null>(null);

  const [backendHealthy, setBackendHealthy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("Ready");
  const [error, setError] = useState("");

  const [createForm, setCreateForm] = useState({
    title: "Checkout API failure spike",
    description: "5xx errors increased after a recent deploy.",
    severity: "sev2" as IncidentSeverity,
    service: "checkout",
    source: "manual",
    impact_summary: "Checkout failures for a subset of users.",
  });

  const [updateStatus, setUpdateStatus] =
    useState<IncidentStatus>("investigating");

  const [alertForm, setAlertForm] = useState({
    title: "High error-rate alert",
    description: "Error rate crossed threshold for checkout-service",
    severity: "critical",
    service: "checkout",
    source: "alertmanager",
    alertSecret: "",
  });

  const [logForm, setLogForm] = useState({
    incidentId: "",
    service: "checkout",
    source: "logs",
    level: "error",
    message: "DB timeout while reserving order row",
    traceId: "trace-123",
  });

  const [githubForm, setGithubForm] = useState({
    incidentId: "",
    eventType: "issue_opened",
    repository: "org/shop-api",
    title: "Investigate checkout timeout regression",
    body: "Customer reports timeout after deployment #834.",
    actor: "release-bot",
    service: "checkout",
    referenceId: "issue-184",
    githubSecret: "",
  });

  const [audience, setAudience] = useState("internal");

  const selectedIncident = useMemo(
    () =>
      incidents.find((incident) => incident.id === selectedIncidentId) ?? null,
    [incidents, selectedIncidentId],
  );

  async function refreshIncidents(selectId?: number): Promise<void> {
    setBusy(true);
    setError("");
    try {
      const data = await apiRequest<Incident[]>("/incidents");
      setIncidents(data);
      if (typeof selectId === "number") {
        setSelectedIncidentId(selectId);
      } else if (!selectedIncidentId && data.length > 0) {
        setSelectedIncidentId(data[0].id);
      } else if (
        selectedIncidentId &&
        !data.some((item) => item.id === selectedIncidentId)
      ) {
        setSelectedIncidentId(data[0]?.id ?? null);
      }
      setNotice(`Loaded ${data.length} incident(s)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load incidents");
    } finally {
      setBusy(false);
    }
  }

  async function checkHealth(): Promise<void> {
    try {
      await apiRequest<{ status: string }>("/health");
      setBackendHealthy(true);
    } catch {
      setBackendHealthy(false);
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
      setNotice(`Timeline refreshed (${data.entries.length} entries)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load timeline");
      setTimeline([]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void checkHealth();
    void refreshIncidents();
  }, []);

  useEffect(() => {
    if (selectedIncidentId) {
      void loadTimeline(selectedIncidentId);
      setAnalysis(null);
      setStatusDraft(null);
      setPostmortem(null);
    }
  }, [selectedIncidentId]);

  async function handleCreateIncident(
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

  async function handleUpdateStatus(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (!selectedIncidentId) {
      setError("Select an incident first");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await apiRequest<Incident>(`/incidents/${selectedIncidentId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: updateStatus }),
      });
      await refreshIncidents(selectedIncidentId);
      setNotice(
        `Incident #${selectedIncidentId} status set to ${updateStatus}`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update incident",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleAlertIngest(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await apiRequest<{ ok: boolean; incident_id: number }>(
        "/ingest/alerts",
        {
          method: "POST",
          headers: {
            ...(alertForm.alertSecret
              ? { "x-alert-secret": alertForm.alertSecret }
              : {}),
          },
          body: JSON.stringify({
            title: alertForm.title,
            description: alertForm.description,
            severity: alertForm.severity,
            service: alertForm.service,
            source: alertForm.source,
            timestamp: nowIso(),
            metadata: { trigger: "frontend" },
          }),
        },
      );
      await refreshIncidents(response.incident_id);
      setNotice(`Alert ingested into incident #${response.incident_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ingest alert");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogIngest(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const incidentId = logForm.incidentId
        ? Number(logForm.incidentId)
        : undefined;
      const response = await apiRequest<{
        ok: boolean;
        incident_id: number;
        events_created: number;
      }>("/ingest/logs", {
        method: "POST",
        body: JSON.stringify({
          incident_id: Number.isFinite(incidentId) ? incidentId : null,
          service: logForm.service,
          source: logForm.source,
          logs: [
            {
              timestamp: nowIso(),
              level: logForm.level,
              message: logForm.message,
              service: logForm.service,
              trace_id: logForm.traceId,
              metadata: { origin: "frontend" },
            },
          ],
        }),
      });

      await refreshIncidents(response.incident_id);
      setNotice(`Ingested ${response.events_created} log event(s)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ingest logs");
    } finally {
      setBusy(false);
    }
  }

  async function handleGithubIngest(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const incidentId = githubForm.incidentId
        ? Number(githubForm.incidentId)
        : undefined;
      const response = await apiRequest<{ ok: boolean; incident_id: number }>(
        "/ingest/github",
        {
          method: "POST",
          headers: {
            ...(githubForm.githubSecret
              ? { "x-github-secret": githubForm.githubSecret }
              : {}),
          },
          body: JSON.stringify({
            incident_id: Number.isFinite(incidentId) ? incidentId : null,
            event_type: githubForm.eventType,
            repository: githubForm.repository,
            title: githubForm.title,
            body: githubForm.body,
            actor: githubForm.actor,
            service: githubForm.service,
            timestamp: nowIso(),
            reference_id: githubForm.referenceId,
            metadata: { source: "frontend" },
          }),
        },
      );
      await refreshIncidents(response.incident_id);
      setNotice(
        `GitHub signal ingested into incident #${response.incident_id}`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to ingest GitHub signal",
      );
    } finally {
      setBusy(false);
    }
  }

  async function runAnalysis(): Promise<void> {
    if (!selectedIncidentId) {
      setError("Select an incident first");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await apiRequest<AnalysisResponse>(
        `/ai/incidents/${selectedIncidentId}/analysis`,
      );
      setAnalysis(response);
      setNotice(`Analysis generated for incident #${selectedIncidentId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate analysis",
      );
    } finally {
      setBusy(false);
    }
  }

  async function runStatusDraft(): Promise<void> {
    if (!selectedIncidentId) {
      setError("Select an incident first");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await apiRequest<StatusDraftResponse>(
        `/ai/incidents/${selectedIncidentId}/status-draft`,
        {
          method: "POST",
          body: JSON.stringify({ audience }),
        },
      );
      setStatusDraft(response);
      setNotice(`Status draft generated (${response.audience})`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate status draft",
      );
    } finally {
      setBusy(false);
    }
  }

  async function runPostmortem(): Promise<void> {
    if (!selectedIncidentId) {
      setError("Select an incident first");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await apiRequest<PostmortemResponse>(
        `/ai/incidents/${selectedIncidentId}/postmortem`,
      );
      setPostmortem(response);
      setNotice(
        `Postmortem draft generated for incident #${selectedIncidentId}`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate postmortem",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">AI Incident Commander</p>
          <h1>Live Incident Operations Desk</h1>
          <p className="lede">
            Ingest alerts, logs, and GitHub activity. Build timelines instantly.
            Generate AI-assisted analysis, status updates, and postmortems from
            one workspace.
          </p>
        </div>
        <div className="health">
          <span className={`pill ${backendHealthy ? "ok" : "down"}`}>
            Backend: {backendHealthy ? "online" : "offline"}
          </span>
          <span className="pill neutral">{busy ? "Working..." : notice}</span>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="workspace">
        <aside className="panel rail">
          <div className="panelHeader">
            <h2>Incidents</h2>
            <button
              type="button"
              onClick={() =>
                void refreshIncidents(selectedIncidentId ?? undefined)
              }
            >
              Refresh
            </button>
          </div>
          <div className="incidentList">
            {incidents.length === 0 ? (
              <p className="empty">No incidents yet.</p>
            ) : null}
            {incidents.map((incident) => (
              <button
                key={incident.id}
                className={`incidentItem ${incident.id === selectedIncidentId ? "active" : ""}`}
                type="button"
                onClick={() => setSelectedIncidentId(incident.id)}
              >
                <strong>
                  #{incident.id} {incident.title}
                </strong>
                <span>{incident.service}</span>
                <span>
                  {incident.severity.toUpperCase()} · {incident.status}
                </span>
              </button>
            ))}
          </div>

          <form className="formCard" onSubmit={handleCreateIncident}>
            <h3>Create Incident</h3>
            <label>
              Title
              <input
                value={createForm.title}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </label>
            <div className="row2">
              <label>
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
                  <option value="sev1">SEV1</option>
                  <option value="sev2">SEV2</option>
                  <option value="sev3">SEV3</option>
                  <option value="sev4">SEV4</option>
                </select>
              </label>
              <label>
                Service
                <input
                  value={createForm.service}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      service: event.target.value,
                    }))
                  }
                  required
                />
              </label>
            </div>
            <label>
              Impact
              <input
                value={createForm.impact_summary}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    impact_summary: event.target.value,
                  }))
                }
              />
            </label>
            <button type="submit">Create</button>
          </form>

          <form className="formCard" onSubmit={handleUpdateStatus}>
            <h3>Update Selected Incident</h3>
            <label>
              Status
              <select
                value={updateStatus}
                onChange={(event) =>
                  setUpdateStatus(event.target.value as IncidentStatus)
                }
              >
                <option value="open">open</option>
                <option value="investigating">investigating</option>
                <option value="mitigated">mitigated</option>
                <option value="resolved">resolved</option>
              </select>
            </label>
            <button type="submit" disabled={!selectedIncident}>
              Apply Status
            </button>
          </form>
        </aside>

        <section className="panel mainPanel">
          <div className="panelHeader">
            <h2>Incident Workspace</h2>
            {selectedIncident ? (
              <span className="pill neutral">
                Selected: #{selectedIncident.id} · {selectedIncident.service}
              </span>
            ) : (
              <span className="pill down">No incident selected</span>
            )}
          </div>

          <div className="cards">
            <article className="card">
              <h3>Signal Ingestion</h3>
              <div className="ingestGrid">
                <form onSubmit={handleAlertIngest} className="formCard compact">
                  <h4>Alert</h4>
                  <label>
                    Alert Secret (header)
                    <input
                      type="password"
                      value={alertForm.alertSecret}
                      onChange={(event) =>
                        setAlertForm((prev) => ({
                          ...prev,
                          alertSecret: event.target.value,
                        }))
                      }
                      placeholder="x-alert-secret"
                    />
                  </label>
                  <label>
                    Title
                    <input
                      value={alertForm.title}
                      onChange={(event) =>
                        setAlertForm((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={alertForm.description}
                      onChange={(event) =>
                        setAlertForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <button type="submit">Ingest Alert</button>
                </form>

                <form onSubmit={handleLogIngest} className="formCard compact">
                  <h4>Logs</h4>
                  <label>
                    Incident ID (optional)
                    <input
                      value={logForm.incidentId}
                      onChange={(event) =>
                        setLogForm((prev) => ({
                          ...prev,
                          incidentId: event.target.value,
                        }))
                      }
                      placeholder="Existing incident id"
                    />
                  </label>
                  <div className="row2">
                    <label>
                      Service
                      <input
                        value={logForm.service}
                        onChange={(event) =>
                          setLogForm((prev) => ({
                            ...prev,
                            service: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      Level
                      <select
                        value={logForm.level}
                        onChange={(event) =>
                          setLogForm((prev) => ({
                            ...prev,
                            level: event.target.value,
                          }))
                        }
                      >
                        <option value="critical">critical</option>
                        <option value="error">error</option>
                        <option value="warning">warning</option>
                        <option value="info">info</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Log Message
                    <textarea
                      value={logForm.message}
                      onChange={(event) =>
                        setLogForm((prev) => ({
                          ...prev,
                          message: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <button type="submit">Ingest Log Event</button>
                </form>

                <form
                  onSubmit={handleGithubIngest}
                  className="formCard compact"
                >
                  <h4>GitHub</h4>
                  <label>
                    GitHub Secret (header)
                    <input
                      type="password"
                      value={githubForm.githubSecret}
                      onChange={(event) =>
                        setGithubForm((prev) => ({
                          ...prev,
                          githubSecret: event.target.value,
                        }))
                      }
                      placeholder="x-github-secret"
                    />
                  </label>
                  <label>
                    Incident ID (optional)
                    <input
                      value={githubForm.incidentId}
                      onChange={(event) =>
                        setGithubForm((prev) => ({
                          ...prev,
                          incidentId: event.target.value,
                        }))
                      }
                      placeholder="Existing incident id"
                    />
                  </label>
                  <label>
                    Repository
                    <input
                      value={githubForm.repository}
                      onChange={(event) =>
                        setGithubForm((prev) => ({
                          ...prev,
                          repository: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Title
                    <input
                      value={githubForm.title}
                      onChange={(event) =>
                        setGithubForm((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <button type="submit">Ingest GitHub Signal</button>
                </form>
              </div>
            </article>

            <article className="card">
              <div className="panelHeader">
                <h3>Timeline</h3>
                <button
                  type="button"
                  onClick={() =>
                    selectedIncidentId && void loadTimeline(selectedIncidentId)
                  }
                  disabled={!selectedIncidentId}
                >
                  Rebuild Timeline
                </button>
              </div>
              {timeline.length === 0 ? (
                <p className="empty">No timeline entries yet.</p>
              ) : null}
              <div className="timeline">
                {timeline.map((entry, index) => (
                  <div
                    key={`${entry.timestamp}-${index}`}
                    className="timelineItem"
                  >
                    <p className="meta">
                      <strong>{entry.category}</strong> ·{" "}
                      {toLocalDateTime(entry.timestamp)} · confidence{" "}
                      {entry.confidence.toFixed(2)}
                    </p>
                    <p className="summary">{entry.summary}</p>
                    <p>{entry.detail}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="card">
              <div className="panelHeader">
                <h3>AI Actions</h3>
                <div className="buttonRow">
                  <button
                    type="button"
                    onClick={() => void runAnalysis()}
                    disabled={!selectedIncidentId}
                  >
                    Generate Analysis
                  </button>
                  <button
                    type="button"
                    onClick={() => void runPostmortem()}
                    disabled={!selectedIncidentId}
                  >
                    Draft Postmortem
                  </button>
                </div>
              </div>
              <div className="statusDraftControls">
                <label>
                  Audience
                  <select
                    value={audience}
                    onChange={(event) => setAudience(event.target.value)}
                  >
                    <option value="internal">internal</option>
                    <option value="external">external</option>
                    <option value="executive">executive</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => void runStatusDraft()}
                  disabled={!selectedIncidentId}
                >
                  Draft Status Update
                </button>
              </div>

              <div className="aiGrid">
                <section>
                  <h4>Analysis</h4>
                  {analysis ? (
                    <>
                      <p>{analysis.summary}</p>
                      <p className="meta">
                        Impacted services:{" "}
                        {analysis.impacted_services.length > 0
                          ? analysis.impacted_services.join(", ")
                          : "none"}
                      </p>
                      {analysis.hypotheses.map((item, index) => (
                        <article
                          key={`${item.summary}-${index}`}
                          className="hypothesis"
                        >
                          <p>
                            <strong>{item.summary}</strong>
                          </p>
                          <p className="meta">
                            confidence {item.confidence.toFixed(2)}
                          </p>
                          <p className="meta">
                            Evidence: {item.evidence.join(" | ")}
                          </p>
                          <p className="meta">
                            Next checks: {item.next_checks.join(" | ")}
                          </p>
                        </article>
                      ))}
                    </>
                  ) : (
                    <p className="empty">Run analysis to see RCA hypotheses.</p>
                  )}
                </section>

                <section>
                  <h4>Status Draft</h4>
                  {statusDraft ? (
                    <>
                      <p className="meta">
                        audience: {statusDraft.audience} · confidence{" "}
                        {statusDraft.confidence.toFixed(2)}
                      </p>
                      <pre>{statusDraft.content}</pre>
                    </>
                  ) : (
                    <p className="empty">
                      Generate a status draft from current timeline context.
                    </p>
                  )}
                </section>

                <section>
                  <h4>Postmortem Draft</h4>
                  {postmortem ? (
                    <>
                      <p className="meta">
                        confidence {postmortem.confidence.toFixed(2)}
                      </p>
                      <pre>{postmortem.content}</pre>
                    </>
                  ) : (
                    <p className="empty">
                      Generate a postmortem once enough events are present.
                    </p>
                  )}
                </section>
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
