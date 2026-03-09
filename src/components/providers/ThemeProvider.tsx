"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "detrimental-dark" | "lucid-light" | "plausible-purple" | "original-orange" | "amber-noir" | "charcoal-black";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "detrimental-dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("detrimental-dark");

  useEffect(() => {
    const stored = localStorage.getItem("adhd-theme") as Theme | null;
    if (stored) setThemeState(stored);
    applyTheme(stored ?? "detrimental-dark");
  }, []);

  function applyTheme(t: Theme) {
    const html = document.documentElement;
    // Set the data attribute for CSS targeting
    html.setAttribute("data-theme", t);
    
    // Also toggle the built-in 'light' class for Tailwind dark mode compat if needed
    if (t === "lucid-light") {
      html.classList.add("light");
    } else {
      html.classList.remove("light");
    }
  }

  function setTheme(next: Theme) {
    setThemeState(next);
    localStorage.setItem("adhd-theme", next);
    applyTheme(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
