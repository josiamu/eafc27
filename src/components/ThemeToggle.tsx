"use client";

import { useLayoutEffect } from "react";
import { createStoredValue, useStoredValue } from "@/lib/stored-value";
import { THEME_STORAGE_KEY, type ThemeChoice } from "@/lib/theme";

const themeStore = createStoredValue<ThemeChoice>(
  THEME_STORAGE_KEY,
  "system",
  (raw) => (raw === "light" || raw === "dark" ? raw : undefined),
  (value) => value,
);

function applyTheme(theme: ThemeChoice) {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
}

const order: ThemeChoice[] = ["system", "light", "dark"];

export function ThemeToggle({ labels }: { labels: Record<ThemeChoice, string> & { theme: string } }) {
  const theme = useStoredValue(themeStore);

  // React's dev remount clears attributes the inline script set on <html>.
  useLayoutEffect(() => applyTheme(theme), [theme]);

  const next = order[(order.indexOf(theme) + 1) % order.length];

  return (
    <button
      type="button"
      onClick={() => themeStore.set(next)}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm text-fg hover:bg-surface-2"
      aria-label={`${labels.theme}: ${labels[theme]}`}
      title={`${labels.theme}: ${labels[theme]}`}
    >
      <ThemeIcon theme={theme} />
      <span className="hidden sm:inline">{labels[theme]}</span>
    </button>
  );
}

function ThemeIcon({ theme }: { theme: ThemeChoice }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": true } as const;
  if (theme === "light")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  if (theme === "dark")
    return (
      <svg {...common}>
        <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}
