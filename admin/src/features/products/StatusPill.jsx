import { cn } from "../../lib/cn"

export default function StatusPill({ active }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-extrabold",
                active
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
            )}
        >
            <span
                className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    active ? "bg-emerald-500" : "bg-rose-500"
                )}
            />
            {active ? "Active" : "Inactive"}
        </span>
    )
}
