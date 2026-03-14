import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredPreference() {
  if (typeof window === "undefined") return "system";

  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" || value === "system"
      ? value
      : "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  const isDark = theme === "dark";

  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
}

export function useTheme() {
  const [preference, setPreference] = useState(getStoredPreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const theme = useMemo(() => {
    return preference === "system" ? systemTheme : preference;
  }, [preference, systemTheme]);

  useEffect(() => {
    applyTheme(theme);

    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // ignore
    }
  }, [theme, preference]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    setSystemTheme(media.matches ? "dark" : "light");

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
    } else {
      media.addListener(handleChange);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", handleChange);
      } else {
        media.removeListener(handleChange);
      }
    };
  }, []);

  const setTheme = useCallback((next) => {
    if (next === "light" || next === "dark" || next === "system") {
      setPreference(next);
    }
  }, []);

  const toggle = useCallback(() => {
    setPreference((prev) => {
      const current = prev === "system" ? getSystemTheme() : prev;
      return current === "dark" ? "light" : "dark";
    });
  }, []);

  return {
    theme,
    preference,
    setTheme,
    toggle,
    isDark: theme === "dark",
  };
}
