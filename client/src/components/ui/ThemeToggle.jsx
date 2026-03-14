import { Moon, Sun } from "lucide-react";
import Button from "./Button";

export default function ThemeToggle({ isDark, onToggle }) {
    return (
        <Button
            variant="secondary"
            size="sm"
            onClick={onToggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
            leftIcon={isDark ? <Sun size={16} /> : <Moon size={16} />}
        >
            {isDark ? "Light" : "Dark"}
        </Button>
    );
}