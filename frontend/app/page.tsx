const panels = [
  "Live incident timeline",
  "AI root-cause hypotheses",
  "Impacted services",
  "Draft status updates",
  "Incident history",
];

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">AI Incident Commander</p>
        <h1>Production incident response, without the chaos.</h1>
        <p className="lede">
          A shared workspace that ingests alerts, logs, and GitHub signals, then turns them into a
          live timeline, cautious RCA suggestions, and ready-to-edit updates.
        </p>
      </section>

      <section className="grid">
        {panels.map((panel) => (
          <article key={panel} className="card">
            <h2>{panel}</h2>
            <p>Backend support is scaffolded and ready for the UI flow to connect next.</p>
          </article>
        ))}
      </section>
    </main>
  );
}

