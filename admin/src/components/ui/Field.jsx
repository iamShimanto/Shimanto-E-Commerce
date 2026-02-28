import { cn } from "../../lib/cn"

export default function Field({ label, hint, error, children, className }) {
    const rightText = error || hint
    const rightClass = error ? "text-rose-700" : "text-(--text-muted)"

    return (
        <label className={cn("block", className)}>
            <div className="flex items-end justify-between gap-3">
                <div className="text-xs font-extrabold text-(--text-muted)">{label}</div>
                {rightText ? (
                    <div className={cn("text-[11px] font-semibold", rightClass)}>
                        {rightText}
                    </div>
                ) : null}
            </div>
            <div className="mt-1">{children}</div>
        </label>
    )
}
