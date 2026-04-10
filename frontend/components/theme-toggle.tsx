"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "incident-commander-theme";

type ThemeMode = "light" | "dark";

function resolveTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode;
  window.localStorage.setItem(STORAGE_KEY, mode);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const initial = resolveTheme();
    setMode(initial);
    applyTheme(initial);
  }, []);

  function toggleTheme(): void {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    applyTheme(next);
  }

  return (
    <button type="button" className="themeButton" onClick={toggleTheme}>
      {mode === "dark" ? "Light" : "Dark"} mode
    </button>
  );
}
