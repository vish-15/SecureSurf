"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string; // "class" or "data-theme"
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

interface ThemeProviderContextValue {
  theme: Theme | undefined;
  setTheme: (theme: Theme) => void;
  resolvedTheme?: "light" | "dark";
}

const ThemeContext = React.createContext<ThemeProviderContextValue | undefined>(
  undefined
);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme", // Changed from "theme" to avoid conflict with shadcn-ui if used elsewhere
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    } catch (e) {
      return defaultTheme;
    }
  });

  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">();

  const applyTheme = React.useCallback((selectedTheme: Theme) => {
    let newTheme: "light" | "dark";
    if (selectedTheme === "system") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      newTheme = systemPrefersDark ? "dark" : "light";
    } else {
      newTheme = selectedTheme as "light" | "dark";
    }

    setResolvedTheme(newTheme);

    const d = document.documentElement;
    if (attribute === "class") {
      d.classList.remove("light", "dark");
      d.classList.add(newTheme);
    } else {
      d.setAttribute(attribute, newTheme);
    }
  }, [attribute]);

  React.useEffect(() => {
    if (theme === undefined) return; // Wait for initial theme state from localStorage
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Listen to system theme changes if "system" theme is enabled and selected
  React.useEffect(() => {
    if (!enableSystem || theme !== "system" || typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [enableSystem, theme, applyTheme]);


  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      if (!disableTransitionOnChange) {
        document.documentElement.classList.add('theme-transition');
      }
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (e) {
        // localStorage is unavailable
      }
      setThemeState(newTheme);
      if (!disableTransitionOnChange) {
         setTimeout(() => {
          document.documentElement.classList.remove('theme-transition');
        }, 500); // Match transition duration
      }
    },
    [storageKey, disableTransitionOnChange]
  );

  // Add CSS for smooth transition if not disabled
  React.useEffect(() => {
    if (!disableTransitionOnChange && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        :root.theme-transition,
        :root.theme-transition *,
        :root.theme-transition ::before,
        :root.theme-transition ::after {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      }
    }
  }, [disableTransitionOnChange]);


  React.useEffect(() => {
    // Initialize theme on mount
    const storedTheme = (() => {
      if (typeof window === 'undefined') {
        return defaultTheme
      }
      try {
        return (localStorage.getItem(storageKey) as Theme) || defaultTheme
      } catch (e) {
        // Unsupported
        return defaultTheme
      }
    })()
    if (storedTheme) {
       setThemeState(storedTheme)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
