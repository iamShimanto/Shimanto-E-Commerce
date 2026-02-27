import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "theme"; // 'light' | 'dark'

function getSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function getStoredTheme() {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        return v === "light" || v === "dark" ? v : null;
    } catch {
        return null;
    }
}

function applyTheme(nextTheme) {
    const isDark = nextTheme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export function useTheme() {
    const initialTheme = useMemo(() => {
        if (typeof window === "undefined") return "light";
        return getStoredTheme() ?? getSystemTheme();
    }, []);

    const [theme, setTheme] = useState(initialTheme);

    useEffect(() => {
        applyTheme(theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // ignore
        }
    }, [theme]);

    useEffect(() => {
        // If user hasn't explicitly chosen (no storage), track system changes
        const stored = getStoredTheme();
        if (stored) return;

        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => setTheme(media.matches ? "dark" : "light");

        if (media.addEventListener) media.addEventListener("change", onChange);
        else media.addListener(onChange);

        return () => {
            if (media.removeEventListener) media.removeEventListener("change", onChange);
            else media.removeListener(onChange);
        };
    }, []);

    const toggle = useCallback(() => {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
    }, []);

    return {
        theme,
        setTheme,
        toggle,
        isDark: theme === "dark",
    };
}
