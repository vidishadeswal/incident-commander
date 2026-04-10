import Link from "next/link";

const features = [
  {
    href: "/incidents",
    title: "Incident Hub",
    description:
      "Command and control center for active incidents. Track status, severity, and assignments in real-time.",
    tag: "Operations",
  },
  {
    href: "/ingestion",
    title: "Signal Ingestion",
    description:
      "Consolidate alerts, logs, and GitHub events into a unified stream for deep analysis.",
    tag: "Data Ingest",
  },
  {
    href: "/timeline",
    title: "Evidence Timeline",
    description:
      "Automatically reconstruct deterministic event chronologies with granular confidence scoring.",
    tag: "Chronology",
  },
  {
    href: "/ai",
    title: "AI Co-pilot",
    description:
      "Leverage LLMs for RCA hypotheses, automated status reports, and instant post-mortem drafts.",
    tag: "Intelligence",
  },
  {
    href: "/how-it-works",
    title: "Operational Guide",
    description:
      "Master the incident response lifecycle with our end-to-end operational playbook.",
    tag: "Methodology",
  },
];

export default function Home() {
  return (
    <main className="page shellGrid">
      {/* Hero Section */}
      <section className="landingHero">
        <div className="eyebrow" style={{ marginBottom: '2rem' }}>The Ultimate Response Workspace</div>
        <h1 style={{ marginBottom: '1.5rem' }}>
          Incident Commander
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '3rem', maxWidth: '900px' }}>
          Master production chaos with deterministic timelines and AI-powered
          intelligence. Collect signals, build context, and resolve incidents 10x faster.
        </p>
        <div className="landingActions">
          <Link href="/incidents" className="ctaButton">
            Launch Command Center
          </Link>
          <Link href="/how-it-works" className="ghostButton">
            Explore Workflow
          </Link>
        </div>
      </section>

      {/* Visual Break / Image Section */}
      <section className="graphicsSection">
        <div>
          <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Full Lifecycle Command</h2>
          <p className="muted" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            From the first alert to the final post-mortem, Incident Commander provides a unified interface 
            for your entire response team. No more fragmented tools or scattered context.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span> Real-time Incident Tracking
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span> Automated Evidence Collection
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span> AI-Powered RCA Hypotheses
            </li>
          </ul>
        </div>
        <div className="floating">
          <img src="/hero.png" alt="Dashboard Preview" className="graphicsImage" />
        </div>
      </section>

      <div className="sectionDivider" />

      {/* Features Grid */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Explore the Ecosystem</h2>
            <p className="muted">Purpose-built modules for every stage of your response.</p>
        </div>
        <div className="featureGrid threeCols">
            {features.map((feature) => (
            <article key={feature.href} className="featureCard">
                <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.1em' }}>{feature.tag}</div>
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
                <Link href={feature.href} className="textLink">
                Access Module <span>→</span>
                </Link>
            </article>
            ))}
        </div>
      </section>

      <div className="sectionDivider" />

      {/* Deep Dive Sections */}
      <section className="graphicsSection" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="floating" style={{ animationDelay: '0.5s' }}>
          <img src="/timeline.png" alt="Timeline Visualization" className="graphicsImage" />
        </div>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Deterministic Chronology</h2>
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            Our timeline engine automatically sorts incoming signals from GitHub, CloudWatch, and your logs 
            into a verified sequence of events. Stop manually piecing together "what happened when."
          </p>
        </div>
      </section>

      <section className="graphicsSection">
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>AI Collaboration</h2>
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            Incident Commander's integrated AI uses your specific incident context to suggest likely root causes 
            and draft stakeholder updates in seconds. Focus on fixing the problem, not writing reports.
          </p>
        </div>
        <div className="floating" style={{ animationDelay: '1s' }}>
          <img src="/ai.png" alt="AI Insights" className="graphicsImage" />
        </div>
      </section>

      {/* Footer-like CTA */}
      <section style={{ textAlign: 'center', padding: '6rem 0', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Ready to command your next incident?</h2>
        <Link href="/incidents" className="ctaButton" style={{ padding: '1.5rem 4rem', fontSize: '1.2rem' }}>
          Get Started Now
        </Link>
      </section>
    </main>
  );
}
