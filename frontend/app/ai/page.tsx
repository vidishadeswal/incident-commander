"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import {
  AnalysisResponse,
  Incident,
  PostmortemResponse,
  StatusDraftResponse,
} from "../../lib/types";

export default function AIPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [audience, setAudience] = useState("internal");

  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [statusDraft, setStatusDraft] = useState<StatusDraftResponse | null>(
    null,
  );
  const [postmortem, setPostmortem] = useState<PostmortemResponse | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    "Use AI outputs after events are ingested and timeline is built.",
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

  useEffect(() => {
    void refreshIncidents();
  }, []);

  async function runAnalysis(): Promise<void> {
    if (!selectedId) {
      setError("Select an incident first");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await apiRequest<AnalysisResponse>(
        `/ai/incidents/${selectedId}/analysis`,
      );
      setAnalysis(response);
      setNotice(`Analysis generated for incident #${selectedId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate analysis",
      );
    } finally {
      setBusy(false);
    }
  }

  async function runStatusDraft(): Promise<void> {
    if (!selectedId) {
      setError("Select an incident first");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await apiRequest<StatusDraftResponse>(
        `/ai/incidents/${selectedId}/status-draft`,
        {
          method: "POST",
          body: JSON.stringify({ audience }),
        },
      );
      setStatusDraft(response);
      setNotice(`Status draft generated for ${response.audience}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to draft status update",
      );
    } finally {
      setBusy(false);
    }
  }

  async function runPostmortem(): Promise<void> {
    if (!selectedId) {
      setError("Select an incident first");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await apiRequest<PostmortemResponse>(
        `/ai/incidents/${selectedId}/postmortem`,
      );
      setPostmortem(response);
      setNotice(`Postmortem draft generated for incident #${selectedId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate postmortem",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page shellGrid">
      <section className="pageIntro">
        <p className="eyebrow">AI Assistant</p>
        <h1>Generate RCA hypotheses and communication drafts</h1>
        <p>
          This page uses current incident context to produce analysis,
          stakeholder updates, and postmortem drafts. Keep humans in review for
          accuracy and tone.
        </p>
        <div className="statusRow">
          <span className="pill neutral">{busy ? "Working..." : notice}</span>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="featureGrid twoCols">
        <article className="panelBox">
          <h2>Controls</h2>
          <label data-tooltip="Select the active incident you want to analyze or draft communications for.">
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
          <label data-tooltip="Tailor the status update draft for different stakeholders (e.g., tech-heavy for internal, high-level for executive).">
            Audience for Status Draft
            <select
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            >
              <option value="internal">Internal (Devs/SREs)</option>
              <option value="external">External (Trust/Twitter)</option>
              <option value="executive">Executive (Leadership)</option>
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
              onClick={() => void runAnalysis()}
              disabled={!selectedId}
            >
              Generate Analysis
            </button>
            <button
              type="button"
              onClick={() => void runStatusDraft()}
              disabled={!selectedId}
            >
              Draft Status Update
            </button>
            <button
              type="button"
              onClick={() => void runPostmortem()}
              disabled={!selectedId}
            >
              Draft Postmortem
            </button>
          </div>
        </article>

        <article className="panelBox">
          <h2>AI Results</h2>
          <div className="resultGrid">
            <section>
              <h3>Analysis</h3>
              {analysis ? (
                <>
                  <p>{analysis.summary}</p>
                  <p className="metaText">
                    Impacted services:{" "}
                    {analysis.impacted_services.join(", ") || "none"}
                  </p>
                  {analysis.hypotheses.map((item, index) => (
                    <article
                      key={`${item.summary}-${index}`}
                      className="miniCard"
                    >
                      <p>
                        <strong>{item.summary}</strong>
                      </p>
                      <p className="metaText">
                        confidence {item.confidence.toFixed(2)}
                      </p>
                      <p className="metaText">
                        Evidence: {item.evidence.join(" | ")}
                      </p>
                    </article>
                  ))}
                </>
              ) : (
                <p className="muted">Run analysis to view hypotheses.</p>
              )}
            </section>

            <section>
              <h3>Status Draft</h3>
              {statusDraft ? (
                <>
                  <p className="metaText">
                    audience: {statusDraft.audience} · confidence{" "}
                    {statusDraft.confidence.toFixed(2)}
                  </p>
                  <pre>{statusDraft.content}</pre>
                </>
              ) : (
                <p className="muted">Generate a status update draft.</p>
              )}
            </section>

            <section>
              <h3>Postmortem Draft</h3>
              {postmortem ? (
                <>
                  <p className="metaText">
                    confidence {postmortem.confidence.toFixed(2)}
                  </p>
                  <pre>{postmortem.content}</pre>
                </>
              ) : (
                <p className="muted">Generate a postmortem draft.</p>
              )}
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
