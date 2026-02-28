import { Moon, Sun } from "lucide-react";

import Button from "./Button"

export default function ThemeToggle({ isDark, onToggle }) {
    return (
        <Button
            type="button"
            onClick={onToggle}
            variant="secondary"
            size="sm"
            className="bg-(--surface)/80 ring-1 ring-black/5"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
        >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
        </Button>
    );
}
