import { cn } from "../../lib/cn"

function statusTone(value) {
    const normalized = String(value || "").toLowerCase()
    if (normalized === "paid" || normalized === "delivered" || normalized === "active") return "ok"
    if (normalized === "pending" || normalized === "processing" || normalized === "confirmed") return "warn"
    if (normalized === "failed" || normalized === "cancelled" || normalized === "refunded") return "bad"
    return "neutral"
}

export function StatusPill({ value }) {
    const tone = statusTone(value)
    const styles = {
        neutral: "bg-(--surface-2) text-(--text-muted) ring-(--border)",
        ok: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
        warn: "bg-amber-50 text-amber-700 ring-amber-200/70",
        bad: "bg-rose-50 text-rose-700 ring-rose-200/70",
    }

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ring-inset",
                styles[tone] || styles.neutral,
            )}
        >
            {value || "—"}
        </span>
    )
}