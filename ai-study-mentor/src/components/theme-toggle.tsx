"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="rounded-full border border-foreground/20 px-3 py-1 text-sm transition hover:border-primary hover:text-primary"
        aria-label="Växla tema"
      >
        ⏳
      </button>
    );
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full border border-foreground/20 px-3 py-1 text-sm transition hover:border-primary hover:text-primary"
      aria-label="Växla mellan ljust och mörkt läge"
    >
      {isDark ? "🌙 Mörkt läge" : "☀️ Ljust läge"}
    </button>
  );
}
