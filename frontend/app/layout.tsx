import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Incident Commander",
  description: "Incident response workspace for logs, alerts, and GitHub activity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

