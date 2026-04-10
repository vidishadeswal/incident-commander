import type { Metadata } from "next";
import { SiteHeader } from "../components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Incident Commander",
  description:
    "Incident response workspace for logs, alerts, and GitHub activity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeBootstrap = `
    (() => {
      try {
        const key = 'incident-commander-theme';
        const saved = localStorage.getItem(key);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const mode = saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light');
        document.documentElement.dataset.theme = mode;
      } catch (_) {
        document.documentElement.dataset.theme = 'light';
      }
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
