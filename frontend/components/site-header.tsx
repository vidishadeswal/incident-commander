"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/incidents", label: "Incidents" },
  { href: "/ingestion", label: "Ingestion" },
  { href: "/timeline", label: "Timeline" },
  { href: "/ai", label: "AI Assistant" },
  { href: "/how-it-works", label: "How It Works" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="topbar">
      <div className="topbarInner">
        <Link href="/" className="brand">
          Incident Commander
        </Link>
        <nav className="nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`navLink ${pathname === link.href ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
