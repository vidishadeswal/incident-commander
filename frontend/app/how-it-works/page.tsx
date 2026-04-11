import Link from "next/link";

const steps = [
  {
    title: "Capture Signals",
    detail:
      "Consolidate alerts, logs, and development activity into a unified intelligence stream. Our ingestion engine normalizes data from every source.",
    href: "/ingestion",
    image: "/ingestion.png",
  },
  {
    title: "Reconstruct Events",
    detail:
      "Build a deterministic evidence chain automatically. Connecting disparate signals via trace IDs and service context to show the real story.",
    href: "/timeline",
    image: "/timeline.png",
  },
  {
    title: "AI Analysis",
    detail:
      "Consult our Llama-powered copilot for root cause hypotheses and automated status drafting. Turn raw data into actionable insights.",
    href: "/ai",
    image: "/ai.png",
  },
  {
    title: "Command Resolution",
    detail:
      "Move incidents from open to resolved with a clear status flow and a shared operational source of truth.",
    href: "/incidents",
    image: "/hub.png",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="page shellGrid">
      <section className="pageIntro">
        <p className="eyebrow">The Playbook</p>
        <h1>Operational Workflow</h1>
        <p>
          From ingestion to resolution, Incident Commander provides a
          streamlined path to production stability.
        </p>
      </section>

      <section className="featureGrid landingFeatureGrid">
        {steps.map((step) => (
          <article
            key={step.title}
            className="featureCard bgFeatureCard glowCard"
            style={{ backgroundImage: `url(${step.image})` }}
          >
            <h2>{step.title}</h2>
            <p>{step.detail}</p>
            <Link href={step.href} className="ghostButton">
              Open module
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
