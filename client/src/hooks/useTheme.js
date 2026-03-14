import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "theme";

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredPreference() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" || value === "system"
      ? value
      : "system";
  } catch {
    return "system";
  }
}

function resolveTheme(preference) {
  return preference === "system" ? getSystemTheme() : preference;
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export function useTheme() {
  const [preference, setPreference] = useState(() => {
    if (typeof window === "undefined") return "system";
    return getStoredPreference();
  });

  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return getSystemTheme();
  });

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
    if (preference !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const onChange = (e) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    if (media.addEventListener) {
      media.addEventListener("change", onChange);
    } else {
      media.addListener(onChange);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", onChange);
      } else {
        media.removeListener(onChange);
      }
    };
  }, [preference]);

  const setTheme = useCallback((next) => {
    setPreference(
      next === "light" || next === "dark" || next === "system"
        ? next
        : "system",
    );
  }, []);

  const toggle = useCallback(() => {
    setPreference((prev) => {
      const current = prev === "system" ? systemTheme : prev;
      return current === "dark" ? "light" : "dark";
    });
  }, [systemTheme]);

  return {
    theme, // resolved theme: light | dark
    preference, // saved choice: system | light | dark
    setTheme,
    toggle,
    isDark: theme === "dark",
  };
}
