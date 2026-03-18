import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "blue" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("iyi-theme");
      if (stored === "dark" || stored === "blue" || stored === "light") return stored;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove("dark", "theme-blue", "theme-light");

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "blue") {
      root.classList.add("dark", "theme-blue");
    } else {
      root.classList.add("theme-light");
    }

    if (switchable) {
      localStorage.setItem("iyi-theme", theme);
    }
  }, [theme, switchable]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  // Legacy toggleTheme for compatibility
  const toggleTheme = switchable
    ? () => setThemeState(prev => (prev === "light" ? "dark" : "light"))
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
