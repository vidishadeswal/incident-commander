import Link from "next/link";

const featureSections = [
  {
    href: "/incidents",
    title: "Incident Hub",
    description:
      "Centrally manage every stage of an active incident. Our Hub provides a unified view of severity, assignments, and resolution status.",
    tag: "Control",
    image: "/hub.png",
  },
  {
    href: "/ingestion",
    title: "Signal Ingestion",
    description:
      "Unify disparate streams of evidence. Ingest alerts, logs, and development events via a robust processing gateway.",
    tag: "Intelligence",
    image: "/ingestion.png",
  },
  {
    href: "/timeline",
    title: "Evidence Timeline",
    description:
      "Automatically piece together the truth. Our deterministic engine builds verified chronologies from every captured signal.",
    tag: "Evidence",
    image: "/timeline.png",
  },
  {
    href: "/ai",
    title: "AI Co-pilot",
    description:
      "Leverage Llama-powered analysis to identify root causes and draft stakeholder updates. Cut through the noise with instant insights.",
    tag: "Automation",
    image: "/ai.png",
  },
];

export default function Home() {
  return (
    <main className="page shellGrid landingPage">
      <section className="landingHero landingHeroCentered">
        <div className="eyebrow">Next-Gen Incident Response</div>
        <h1>Incident Commander</h1>
        <p>
          Master production chaos with verified timelines and Llama-powered
          intelligence. The unified workspace for high-stakes site reliability.
        </p>
        <div className="landingActions">
          <Link href="/incidents" className="ctaButton">
            Launch Hub
          </Link>
          <Link href="/how-it-works" className="ghostButton">
            View Workflow
          </Link>
        </div>
      </section>

      <section className="featureGrid landingFeatureGrid">
        {featureSections.map((feature) => (
          <article
            key={feature.title}
            className="featureCard bgFeatureCard glowCard"
            style={{ backgroundImage: `url(${feature.image})` }}
          >
            <div className="cardTag">{feature.tag}</div>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
            <Link href={feature.href} className="ghostButton">
              Open {feature.title}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
