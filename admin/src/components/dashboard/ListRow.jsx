import { cn } from "../../lib/cn"

export function ListRow({ title, subtitle, meta, right, accent = "neutral" }) {
    const accentStyles = {
        neutral: "bg-(--surface-2) text-(--text-muted)",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        danger: "bg-rose-50 text-rose-700",
        info: "bg-sky-50 text-sky-700",
    }

    return (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-(--border) bg-(--surface-2) px-3 py-3">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-extrabold">{title}</div>
                    {meta ? (
                        <span
                            className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                                accentStyles[accent] || accentStyles.neutral,
                            )}
                        >
                            {meta}
                        </span>
                    ) : null}
                </div>
                {subtitle ? (
                    <div className="mt-1 truncate text-xs font-semibold text-(--text-muted)">{subtitle}</div>
                ) : null}
            </div>
            {right ? <div className="shrink-0 text-right text-xs font-extrabold">{right}</div> : null}
        </div>
    )
}
