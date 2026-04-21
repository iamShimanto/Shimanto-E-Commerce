"use client";

import React from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "@/hooks/useTheme";

type ThemeValue = "light" | "dark";

export interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        title="Toggle theme"
        disabled
        className={[
          "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition-all duration-200 backdrop-blur-xl",
          "pointer-events-none opacity-0",
          "dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-200",
          "h-11 w-11 sm:h-12 sm:w-12",
          className ?? "",
        ].join(" ")}
      >
        <FiMoon className="h-5 w-5" />
      </button>
    );
  }

  const currentTheme = (theme === "system" ? resolvedTheme : theme) ?? "light";
  const isDark = currentTheme === "dark";
  const nextTheme: ThemeValue = isDark ? "light" : "dark";
  const Icon = isDark ? FiSun : FiMoon;

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      className={[
        "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition-all duration-200 backdrop-blur-xl",
        "hover:-translate-y-0.5 hover:border-sky-300 hover:text-slate-950 hover:shadow-md",
        "dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-200 dark:hover:border-sky-500/40 dark:hover:text-white",
        "opacity-100",
        "h-11 w-11 sm:h-12 sm:w-12",
        className ?? "",
      ].join(" ")}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
