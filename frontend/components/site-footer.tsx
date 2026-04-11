import Link from "next/link";

export function SiteFooter() {
  return (
    <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)', padding: '6rem 2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem' }}>
        <div>
          <div className="brand" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Incident Commander
          </div>
          <p className="muted" style={{ fontSize: '1rem' }}>
            Building the future of incident response with deterministic context and AI intelligence.
          </p>
        </div>
        
        <div>
          <h4 style={{ marginBottom: '1.5rem', fontWeight: '800' }}>Platform</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><Link href="/incidents" className="navLink" style={{ padding: 0 }}>Incident Hub</Link></li>
            <li><Link href="/ingestion" className="navLink" style={{ padding: 0 }}>Signal Ingestion</Link></li>
            <li><Link href="/timeline" className="navLink" style={{ padding: 0 }}>Evidence Timeline</Link></li>
            <li><Link href="/ai" className="navLink" style={{ padding: 0 }}>AI Co-pilot</Link></li>
          </ul>
        </div>

        <div>
           <h4 style={{ marginBottom: '1.5rem', fontWeight: '800' }}>Resources</h4>
           <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <li><Link href="/how-it-works" className="navLink" style={{ padding: 0 }}>Methodology</Link></li>
             <li><Link href="#" className="navLink" style={{ padding: 0 }}>Documentation</Link></li>
             <li><Link href="#" className="navLink" style={{ padding: 0 }}>API Status</Link></li>
           </ul>
        </div>

        <div>
           <h4 style={{ marginBottom: '1.5rem', fontWeight: '800' }}>Legal</h4>
           <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <li><Link href="#" className="navLink" style={{ padding: 0 }}>Privacy Policy</Link></li>
             <li><Link href="#" className="navLink" style={{ padding: 0 }}>Terms of Service</Link></li>
           </ul>
        </div>
      </div>
      <div style={{ maxWidth: '1400px', margin: '4rem auto 0', paddingTop: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
         <p className="muted" style={{ fontSize: '0.9rem' }}>© 2026 Incident Commander. All rights reserved.</p>
      </div>
    </footer>
  );
}
