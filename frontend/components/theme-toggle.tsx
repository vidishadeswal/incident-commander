"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "incident-commander-theme";

type ThemeMode = "light" | "dark";

function resolveTheme(): ThemeMode {
  /*
  if (typeof window === "undefined" || !window.localStorage) {
    return "light";
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
  } catch (_) {
    // ignore
  }
  */
  return "dark"; // Default to dark for premium look
}

function applyTheme(mode: ThemeMode): void {
  if (typeof window === "undefined") return;
  document.documentElement.dataset.theme = mode;
  /*
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch (_) {
    // ignore
  }
  */
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("dark");

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
