import { useEffect } from "react"
import { X } from "lucide-react"

export default function Modal({ open, title, description, onClose, children }) {
    useEffect(() => {
        if (!open) return
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-black/45 backdrop-blur-lg"
                onClick={onClose}
            />
            <div className="absolute inset-0 overflow-y-auto p-4 sm:p-8">
                <div className="mx-auto w-full max-w-5xl">
                    <div className="overflow-hidden rounded-3xl border border-(--border) bg-(--surface) shadow-2xl shadow-black/20 ring-1 ring-black/5" style={{ boxShadow: "var(--shadow-soft)" }}>
                        <div className="flex items-start justify-between gap-3 border-b border-(--border) bg-linear-to-r from-(--surface) to-(--surface-2) px-5 py-4">
                            <div className="min-w-0">
                                <div className="truncate text-base font-extrabold tracking-tight">
                                    {title}
                                </div>
                                {description ? (
                                    <div className="mt-0.5 text-sm font-semibold text-(--text-muted)">
                                        {description}
                                    </div>
                                ) : null}
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-2xl p-2 text-(--text-muted) transition hover:bg-(--surface-2) hover:text-(--text)"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="px-5 py-5 sm:px-6">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
