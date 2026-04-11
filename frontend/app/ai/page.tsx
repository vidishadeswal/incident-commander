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

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("AI Copilot ready for analysis.");

  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [statusDraft, setStatusDraft] = useState<StatusDraftResponse | null>(
    null,
  );
  const [postmortem, setPostmortem] = useState<PostmortemResponse | null>(null);

  async function loadIncidents(): Promise<void> {
    try {
      const data = await apiRequest<Incident[]>("/incidents");
      setIncidents(data);
      if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id);
      }
    } catch {
      // keep page usable
    }
  }

  useEffect(() => {
    void loadIncidents();
  }, []);

  async function runAnalysis(): Promise<void> {
    if (!selectedId) return;
    setBusy(true);
    setError("");
    try {
      const resp = await apiRequest<AnalysisResponse>(
        `/ai/incidents/${selectedId}/analysis`,
      );
      setAnalysis(resp);
      setNotice("Critical path analysis complete.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  }

  async function runStatusDraft(): Promise<void> {
    if (!selectedId) return;
    setBusy(true);
    setError("");
    try {
      const resp = await apiRequest<StatusDraftResponse>(
        `/ai/incidents/${selectedId}/status-draft`,
        {
          method: "POST",
          body: JSON.stringify({ audience }),
        },
      );
      setStatusDraft(resp);
      setNotice(`Drafted ${audience} status update.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Drafting failed");
    } finally {
      setBusy(false);
    }
  }

  async function runPostmortem(): Promise<void> {
    if (!selectedId) return;
    setBusy(true);
    setError("");
    try {
      const resp = await apiRequest<PostmortemResponse>(
        `/ai/incidents/${selectedId}/postmortem`,
      );
      setPostmortem(resp);
      setNotice("Post-mortem skeleton generated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page shellGrid">
      <section className="pageIntro">
        <p className="eyebrow">Intelligence</p>
        <h1>AI Decision Support</h1>
        <p style={{ fontSize: "1.5rem" }}>
          Leverage high-performance LLMs to distill incident context into Root
          Cause Hypotheses and polished stakeholder communications.
        </p>
        <div
          className="statusRow"
          style={{
            marginTop: "2.5rem",
            display: "flex",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <span
            className="pill neutral"
            style={{ padding: "10px 20px", fontSize: "1rem" }}
          >
            {busy ? "Thinking..." : notice}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "rgba(112, 0, 255, 0.15)",
              padding: "10px 20px",
              borderRadius: "999px",
              border: "1px solid var(--secondary)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                background: "var(--success)",
                borderRadius: "50%",
                boxShadow: "0 0 10px var(--success)",
              }}
            />
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: "800",
                color: "var(--ink)",
              }}
            >
              Engine: Llama 3 (Llama.cpp)
            </span>
          </div>
        </div>
        {error ? (
          <p className="error" style={{ marginTop: "2rem" }}>
            {error}
          </p>
        ) : null}
      </section>

      <section className="splitPane">
        <article className="panelBox">
          <h2 style={{ marginBottom: "3rem" }}>Context Controls</h2>
          <div className="formBlock">
            <label data-tooltip="Select the active incident you want to analyze or draft communications for.">
              Target Incident
              <select
                style={{ marginTop: "1rem" }}
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
              Communication Audience
              <select
                style={{ marginTop: "1rem" }}
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
              >
                <option value="internal">Internal (Devs/SREs)</option>
                <option value="external">External (Trust/Twitter)</option>
                <option value="executive">Executive (Leadership)</option>
              </select>
            </label>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                marginTop: "2rem",
              }}
            >
              <button
                type="button"
                className="ctaButton"
                style={{ width: "100%", maxWidth: "none" }}
                onClick={() => void runAnalysis()}
                disabled={!selectedId || busy}
              >
                Run RCA Analysis
              </button>
              <button
                type="button"
                className="ctaButton"
                style={{
                  width: "100%",
                  maxWidth: "none",
                  background: "var(--secondary)",
                }}
                onClick={() => void runStatusDraft()}
                disabled={!selectedId || busy}
              >
                Draft Status Update
              </button>
              <button
                type="button"
                className="ghostButton"
                style={{ width: "100%" }}
                onClick={() => void runPostmortem()}
                disabled={!selectedId || busy}
              >
                Generate Post-mortem
              </button>
            </div>
          </div>
        </article>

        <article className="panelBox" style={{ minHeight: "600px" }}>
          <h2 style={{ marginBottom: "3rem" }}>Copilot Insights</h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "4rem" }}
          >
            {/* Analysis Section */}
            <section>
              <h3
                style={{
                  textTransform: "uppercase",
                  fontSize: "0.9rem",
                  letterSpacing: "0.1em",
                  color: "var(--accent)",
                  marginBottom: "1.5rem",
                }}
              >
                Automated Analysis
              </h3>
              {analysis ? (
                <div
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    padding: "2.5rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    style={{
                      color: "var(--ink)",
                      fontSize: "1.2rem",
                      marginBottom: "2rem",
                    }}
                  >
                    {analysis.summary}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    {analysis.hypotheses.map((h, i) => (
                      <div
                        key={i}
                        style={{
                          paddingLeft: "1.5rem",
                          borderLeft: "2px solid var(--accent)",
                        }}
                      >
                        <strong
                          style={{ display: "block", marginBottom: "0.5rem" }}
                        >
                          Hypothesis {i + 1}
                        </strong>
                        <p style={{ fontSize: "1rem" }}>{h.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="muted">
                  Run RCA Analysis to generate hypotheses.
                </p>
              )}
            </section>

            {/* Status Draft Section */}
            <section>
              <h3
                style={{
                  textTransform: "uppercase",
                  fontSize: "0.9rem",
                  letterSpacing: "0.1em",
                  color: "var(--secondary)",
                  marginBottom: "1.5rem",
                }}
              >
                Stakeholder Draft
              </h3>
              {statusDraft ? (
                <div
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    padding: "2.5rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "monospace",
                      fontSize: "1rem",
                    }}
                  >
                    {statusDraft.content}
                  </p>
                </div>
              ) : (
                <p className="muted">Draft an update to see results here.</p>
              )}
            </section>

            {/* Post-mortem Section */}
            {postmortem && (
              <section>
                <h3
                  style={{
                    textTransform: "uppercase",
                    fontSize: "0.9rem",
                    letterSpacing: "0.1em",
                    color: "#fff",
                    marginBottom: "1.5rem",
                  }}
                >
                  Post-mortem Skeleton
                </h3>
                <div
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    padding: "2.5rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p style={{ whiteSpace: "pre-wrap", fontSize: "1rem" }}>
                    {postmortem.content}
                  </p>
                </div>
              </section>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
