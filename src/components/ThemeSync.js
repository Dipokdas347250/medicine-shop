"use client";

import { useEffect } from "react";
import { useHydrated, useStore } from "@/lib/store";

// Keeps the <html> dark class in sync with the saved theme (including changes from other tabs).
export default function ThemeSync() {
  const theme = useStore((s) => s.theme);
  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated) document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, hydrated]);
  return null;
}
