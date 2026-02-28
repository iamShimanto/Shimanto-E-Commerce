import { AlertTriangle, Check, Info, Loader2, X } from "lucide-react";

export default function ToastCard({
    t,
    variant = "info",
    title,
    message,
    duration,
    onDismiss,
}) {
    const styles = {
        success: {
            accent: "#10b981",
            iconBg: "rgba(16,185,129,.14)",
            iconColor: "#10b981",
            bar: "#10b981",
            Icon: Check,
        },
        error: {
            accent: "#ef4444",
            iconBg: "rgba(239,68,68,.12)",
            iconColor: "#ef4444",
            bar: "#ef4444",
            Icon: X,
        },
        warning: {
            accent: "#f59e0b",
            iconBg: "rgba(245,158,11,.12)",
            iconColor: "#f59e0b",
            bar: "#f59e0b",
            Icon: AlertTriangle,
        },
        loading: {
            accent: "#60a5fa",
            iconBg: "rgba(59,130,246,.12)",
            iconColor: "#60a5fa",
            bar: "#60a5fa",
            Icon: Loader2,
        },
        info: {
            accent: "#818cf8",
            iconBg: "rgba(99,102,241,.12)",
            iconColor: "#818cf8",
            bar: "#818cf8",
            Icon: Info,
        },
    };

    const s = styles[variant] || styles.info;
    const Icon = s.Icon;

    const isLoading = variant === "loading";
    const shouldShowProgress =
        !isLoading && typeof duration === "number" && Number.isFinite(duration) && duration > 0;

    return (
        <div
            className={`toast-card ${t?.visible ? "toast-enter" : "toast-exit"} group relative w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 text-slate-900 shadow-xl shadow-black/10 ring-1 ring-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:text-white dark:shadow-black/50 dark:ring-white/10`}
            role="status"
            aria-live={variant === "error" ? "assertive" : "polite"}
        >
            <div
                className="absolute left-0 top-0 h-full w-1"
                style={{
                    background: `linear-gradient(180deg, ${s.accent}, rgba(0,0,0,0))`,
                }}
            />

            <button
                type="button"
                onClick={onDismiss}
                className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-500 transition hover:bg-black/5 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-black/10 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white dark:focus:ring-white/20"
                aria-label="Dismiss toast"
            >
                <X size={16} />
            </button>

            <div className="flex gap-3 p-3.5 pr-10">
                <div
                    className="grid h-9 w-9 flex-none place-items-center rounded-xl ring-1 ring-black/5 dark:ring-white/10"
                    style={{ background: s.iconBg }}
                >
                    {isLoading ? (
                        <Icon size={20} color={s.iconColor} className="animate-spin" />
                    ) : (
                        <Icon size={20} color={s.iconColor} />
                    )}
                </div>

                <div className="min-w-0">
                    <div className="text-sm font-semibold leading-5">
                        {title}
                    </div>
                    {message ? (
                        <div className="mt-0.5 text-xs font-medium leading-4 text-slate-600 dark:text-white/70">
                            {message}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="h-0.5 bg-slate-200/80 dark:bg-white/10">
                {isLoading ? (
                    <div
                        className="h-full w-full animate-pulse"
                        style={{ background: `linear-gradient(90deg, transparent, ${s.bar}, transparent)` }}
                    />
                ) : shouldShowProgress ? (
                    <div
                        className="toast-progress h-full w-full"
                        style={{
                            background: s.bar,
                            animationDuration: `${duration}ms`,
                        }}
                    />
                ) : (
                    <div className="h-full w-full" style={{ background: s.bar, opacity: 0.4 }} />
                )}
            </div>
        </div>
    );
}