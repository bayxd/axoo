"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type BrandTheme = "cyberpunk" | "frutiger";

interface ThemeStyleContextValue {
  theme: BrandTheme;
  setTheme: (theme: BrandTheme) => void;
  toggleTheme: () => void;
}

const ThemeStyleContext = createContext<ThemeStyleContextValue | undefined>(
  undefined
);

export function ThemeStyleProvider({ children }: { children: ReactNode }) {
  // No persistence — always starts on "cyberpunk" on every page load/refresh.
  const [theme, setTheme] = useState<BrandTheme>("cyberpunk");

  const toggleTheme = () =>
    setTheme((prev) => (prev === "cyberpunk" ? "frutiger" : "cyberpunk"));

  return (
    <ThemeStyleContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {/* data-brand-theme lets ANY component or globals.css target the
          active theme via [data-brand-theme="frutiger"] selectors,
          even before every component is migrated to useThemeStyle(). */}
      <div data-brand-theme={theme}>{children}</div>
    </ThemeStyleContext.Provider>
  );
}

export function useThemeStyle() {
  const ctx = useContext(ThemeStyleContext);
  if (!ctx) {
    throw new Error("useThemeStyle must be used within a ThemeStyleProvider");
  }
  return ctx;
}