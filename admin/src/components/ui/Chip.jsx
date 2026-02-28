import { X } from "lucide-react"

export default function Chip({ children, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--surface-2) px-2 py-1 text-xs font-extrabold text-(--text)">
            <span className="max-w-45 truncate">{children}</span>
            {onRemove ? (
                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-full p-0.5 text-(--text-muted) hover:text-(--text)"
                    aria-label="Remove"
                >
                    <X size={14} />
                </button>
            ) : null}
        </span>
    )
}
