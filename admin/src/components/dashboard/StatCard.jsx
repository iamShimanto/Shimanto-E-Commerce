import { cn } from "../../lib/cn"

export function StatCard({ label, value, hint, accent = "neutral" }) {
    const accents = {
        neutral: "from-slate-500/10 via-transparent to-transparent",
        success: "from-emerald-500/15 via-transparent to-transparent",
        warning: "from-amber-500/15 via-transparent to-transparent",
        danger: "from-rose-500/15 via-transparent to-transparent",
        info: "from-sky-500/15 via-transparent to-transparent",
    }

    return (
        <div className="relative overflow-hidden rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
            <div className={cn("pointer-events-none absolute inset-0 bg-linear-to-br", accents[accent] || accents.neutral)} />
            <div className="relative">
                <div className="text-xs font-semibold text-(--text-muted)">{label}</div>
                <div className="mt-1 flex items-end justify-between gap-2">
                    <div className="text-2xl font-extrabold tracking-tight">{value}</div>
                </div>
                {hint ? (
                    <div className="mt-1 text-xs font-semibold text-(--text-muted)">{hint}</div>
                ) : null}
            </div>
        </div>
    )
}