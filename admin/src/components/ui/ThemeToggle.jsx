import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ isDark, onToggle }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-black/5 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:focus:ring-white/20"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
        >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
        </button>
    );
}
