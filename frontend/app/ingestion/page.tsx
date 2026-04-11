"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest, nowIso } from "../../lib/api";
import { Incident } from "../../lib/types";

export default function IngestionPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    "Ingest external signals to enrich incident context.",
  );

  const [alertForm, setAlertForm] = useState({
    title: "High error-rate alert",
    description: "Error threshold exceeded for checkout-service",
    severity: "critical",
    service: "checkout",
    source: "alertmanager",
    secret: "",
  });

  const [logForm, setLogForm] = useState({
    incident_id: "",
    service: "checkout",
    source: "logs",
    level: "error",
    message: "Timeout while fetching inventory",
    trace_id: "trace-demo-1",
  });

  const [githubForm, setGithubForm] = useState({
    incident_id: "",
    event_type: "issue_opened",
    repository: "org/shop-api",
    title: "Checkout timeout investigation",
    body: "Potential regression from latest release",
    actor: "release-bot",
    service: "checkout",
    reference_id: "issue-101",
    secret: "",
  });

  async function loadIncidents(): Promise<void> {
    try {
      const data = await apiRequest<Incident[]>("/incidents");
      setIncidents(data);
    } catch {
      // keep page usable if list fails
    }
  }

  useEffect(() => {
    void loadIncidents();
  }, []);

  async function handleAlert(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await apiRequest<{ ok: boolean; incident_id: number }>(
        "/ingest/alerts",
        {
          method: "POST",
          headers: alertForm.secret
            ? { "x-alert-secret": alertForm.secret }
            : undefined,
          body: JSON.stringify({
            title: alertForm.title,
            description: alertForm.description,
            severity: alertForm.severity,
            service: alertForm.service,
            source: alertForm.source,
            timestamp: nowIso(),
            metadata: { via: "frontend-ingestion" },
          }),
        },
      );
      setNotice(`Alert ingested into incident #${response.incident_id}`);
      await loadIncidents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ingest alert");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogs(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const incidentId = logForm.incident_id
        ? Number(logForm.incident_id)
        : null;
      const response = await apiRequest<{
        ok: boolean;
        incident_id: number;
        events_created: number;
      }>("/ingest/logs", {
        method: "POST",
        body: JSON.stringify({
          incident_id: incidentId,
          service: logForm.service,
          source: logForm.source,
          logs: [
            {
              timestamp: nowIso(),
              level: logForm.level,
              message: logForm.message,
              service: logForm.service,
              trace_id: logForm.trace_id,
              metadata: { via: "frontend-ingestion" },
            },
          ],
        }),
      });
      setNotice(
        `Ingested ${response.events_created} log event(s) into incident #${response.incident_id}`,
      );
      await loadIncidents();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to ingest log event",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleGithub(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const incidentId = githubForm.incident_id
        ? Number(githubForm.incident_id)
        : null;
      const response = await apiRequest<{ ok: boolean; incident_id: number }>(
        "/ingest/github",
        {
          method: "POST",
          headers: githubForm.secret
            ? { "x-github-secret": githubForm.secret }
            : undefined,
          body: JSON.stringify({
            incident_id: incidentId,
            event_type: githubForm.event_type,
            repository: githubForm.repository,
            title: githubForm.title,
            body: githubForm.body,
            actor: githubForm.actor,
            service: githubForm.service,
            timestamp: nowIso(),
            reference_id: githubForm.reference_id,
            metadata: { via: "frontend-ingestion" },
          }),
        },
      );
      setNotice(
        `GitHub signal ingested into incident #${response.incident_id}`,
      );
      await loadIncidents();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to ingest GitHub signal",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page shellGrid">
      <section className="pageIntro">
        <p className="eyebrow">Ingestion</p>
        <h1>Signal Command Center</h1>
        <p style={{ fontSize: '1.5rem' }}>
          Consolidate disparate signals into a unified intelligence stream. 
          Manually ingest alerts, logs, and GitHub events to simulate production traffic.
        </p>
        <div className="statusRow" style={{ marginTop: '2.5rem' }}>
          <span className="pill neutral" style={{ padding: '10px 20px', fontSize: '1rem' }}>{busy ? "Working..." : notice}</span>
        </div>
        {error ? <p className="error" style={{ marginTop: '2rem' }}>{error}</p> : null}
      </section>

      <section className="featureGrid threeCols">
        {/* Alert Ingestion */}
        <article className="panelBox" style={{ padding: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Alert Gateway</h2>
          <p className="muted" style={{ marginBottom: '2.5rem' }}>Posts to <code>/ingest/alerts</code></p>
          <form className="formBlock" onSubmit={handleAlert}>
            <label data-tooltip="Optional authentication secret for the alert ingestion endpoint.">
              x-alert-secret
              <input
                type="password"
                placeholder="••••••••"
                value={alertForm.secret}
                onChange={(event) =>
                  setAlertForm((prev) => ({
                    ...prev,
                    secret: event.target.value,
                  }))
                }
              />
            </label>
            <label data-tooltip="The headline of the incoming alert (e.g., 'High Error Rate').">
              Title
              <input
                required
                placeholder="High error-rate alert"
                value={alertForm.title}
                onChange={(event) =>
                  setAlertForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <label data-tooltip="Detailed alert payload or message.">
              Description
              <textarea
                placeholder="Error threshold exceeded for checkout-service..."
                value={alertForm.description}
                onChange={(event) =>
                  setAlertForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </label>
            <button type="submit" className="ctaButton" style={{ width: '100%', maxWidth: 'none', marginTop: '1.5rem' }}>Ingest Alert</button>
          </form>
        </article>

        {/* Log Ingestion */}
        <article className="panelBox" style={{ padding: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Log Stream</h2>
          <p className="muted" style={{ marginBottom: '2.5rem' }}>Posts to <code>/ingest/logs</code></p>
          <form className="formBlock" onSubmit={handleLogs}>
            <label data-tooltip="Link this log to an existing incident ID, or leave blank to create a new one.">
              Incident ID (optional)
              <input
                list="incident-options-logs"
                placeholder="Select or enter ID"
                value={logForm.incident_id}
                onChange={(event) =>
                  setLogForm((prev) => ({
                    ...prev,
                    incident_id: event.target.value,
                  }))
                }
              />
            </label>
            <div className="inlineGrid" style={{ gap: '1.5rem' }}>
              <label data-tooltip="The name of the service that generated this log.">
                Service
                <input
                  placeholder="checkout-service"
                  value={logForm.service}
                  onChange={(event) =>
                    setLogForm((prev) => ({
                      ...prev,
                      service: event.target.value,
                    }))
                  }
                />
              </label>
              <label data-tooltip="The severity level of the log message.">
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
                  <option value="critical">Critical</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </label>
            </div>
            <label data-tooltip="The actual log message content.">
              Message
              <textarea
                placeholder="Timeout while fetching inventory..."
                value={logForm.message}
                onChange={(event) =>
                  setLogForm((prev) => ({
                    ...prev,
                    message: event.target.value,
                  }))
                }
              />
            </label>
            <button type="submit" className="ctaButton" style={{ width: '100%', maxWidth: 'none', marginTop: '1.5rem' }}>Ingest Log Event</button>
          </form>
        </article>

        {/* GitHub Ingestion */}
        <article className="panelBox" style={{ padding: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Repo Activity</h2>
          <p className="muted" style={{ marginBottom: '2.5rem' }}>Posts to <code>/ingest/github</code></p>
          <form className="formBlock" onSubmit={handleGithub}>
            <label data-tooltip="Authentication secret for GitHub webhooks.">
              x-github-secret
              <input
                type="password"
                placeholder="••••••••"
                value={githubForm.secret}
                onChange={(event) =>
                  setGithubForm((prev) => ({
                    ...prev,
                    secret: event.target.value,
                  }))
                }
              />
            </label>
            <div className="inlineGrid" style={{ gap: '1.5rem' }}>
              <label data-tooltip="Link this event to an existing incident ID.">
                Incident ID (optional)
                <input
                  list="incident-options-github"
                  placeholder="Select or enter ID"
                  value={githubForm.incident_id}
                  onChange={(event) =>
                    setGithubForm((prev) => ({
                      ...prev,
                      incident_id: event.target.value,
                    }))
                  }
                />
              </label>
              <label data-tooltip="The repository name where the event occurred.">
                Repository
                <input
                  placeholder="org/shop-api"
                  value={githubForm.repository}
                  onChange={(event) =>
                    setGithubForm((prev) => ({
                      ...prev,
                      repository: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label data-tooltip="Title of the GitHub issue or PR.">
              Title
              <input
                placeholder="Checkout timeout investigation"
                value={githubForm.title}
                onChange={(event) =>
                  setGithubForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <button type="submit" className="ctaButton" style={{ width: '100%', maxWidth: 'none', marginTop: '1.5rem' }}>Ingest GitHub Signal</button>
          </form>
        </article>
      </section>

      <datalist id="incident-options-logs">
        {incidents.map((incident) => (
          <option key={incident.id} value={incident.id.toString()}>
            #{incident.id} {incident.title}
          </option>
        ))}
      </datalist>
      <datalist id="incident-options-github">
        {incidents.map((incident) => (
          <option key={incident.id} value={incident.id.toString()}>
            #{incident.id} {incident.title}
          </option>
        ))}
      </datalist>
    </main>
  );
}
