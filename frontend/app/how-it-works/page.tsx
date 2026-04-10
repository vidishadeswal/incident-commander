import Link from "next/link";

const steps = [
  {
    title: "1. Capture Signals",
    detail:
      "Use the Ingestion page to submit alerts, logs, and GitHub events. Signals are normalized into a common event model.",
  },
  {
    title: "2. Build Timeline",
    detail:
      "Open the Timeline page to rebuild deterministic incident chronology from stored events.",
  },
  {
    title: "3. Analyze with AI",
    detail:
      "Use the AI Assistant page to generate RCA hypotheses, internal/external status drafts, and postmortems.",
  },
  {
    title: "4. Operate and Resolve",
    detail:
      "Use the Incidents page to create incidents manually and update lifecycle status until resolved.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="page shellGrid">
      <section className="pageIntro">
        <p className="eyebrow">Operational Playbook</p>
        <h1>Mastering Incident Commander</h1>
        <p>
          Incident Commander is designed for velocity. Our workspace is organized 
          into focused modules to help responders maintain flow and reduce cognitive load 
          during high-pressure events.
        </p>
      </section>

      <section className="featureGrid twoCols">
        <article className="panelBox">
          <h2>Standard Operating Procedure</h2>
          <div className="listStack">
            {steps.map((step) => (
              <div key={step.title} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <p>
                  <strong style={{ color: 'var(--accent)' }}>{step.title}</strong>
                </p>
                <p className="muted">{step.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panelBox">
          <h2>Module Inventory</h2>
          <div className="listStack">
            <Link href="/incidents" className="listItem linkItem">
              <strong>Incident Hub</strong>
              <span>Create and update incident records and status.</span>
            </Link>
            <Link href="/ingestion" className="listItem linkItem">
              <strong>Signal Ingestion</strong>
              <span>Submit alert/log/GitHub signals into the backend.</span>
            </Link>
            <Link href="/timeline" className="listItem linkItem">
              <strong>Evidence Timeline</strong>
              <span>Rebuild and inspect timeline entries per incident.</span>
            </Link>
            <Link href="/ai" className="listItem linkItem">
              <strong>AI Co-pilot</strong>
              <span>Generate analysis, drafts, and postmortem content.</span>
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
