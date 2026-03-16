import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext(undefined);

let idCounter = 0;
const genId = () => `toast_${Date.now()}_${++idCounter}`;

/**
 * ToastProvider
 * Wrap your app with <ToastProvider> to enable toast notifications.
 */
export function ToastProvider({
    children,
    position = "top-left",
    maxToasts = 5,
    defaultDuration = 2000,
}) {
    const [toasts, setToasts] = useState([]);

    // Create a toast
    const push = (opts) => {
        const id = opts.id ?? genId();
        const toast = {
            id,
            title: opts.title || "",
            description: opts.description ?? opts.message ?? "",
            variant: opts.variant || "info",
            duration:
                typeof opts.duration === "number" ? opts.duration : defaultDuration,
            pauseOnHover: opts.pauseOnHover ?? true,
            createdAt: Date.now(),
        };

        setToasts((prev) => {
            if (prev.some((t) => t.id === id)) return prev;
            return [toast, ...prev].slice(0, maxToasts);
        });

        return id;
    };

    // Dismiss a specific toast
    const dismiss = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // Clear all toasts
    const clear = () => setToasts([]);

    const value = { toasts, push, dismiss, clear };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastPortal position={position} toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}

/**
 * Custom Hook — useToast()
 * Usage: const { push, dismiss, clear } = useToast()
 */
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx)
        throw new Error("❌ useToast must be used within a <ToastProvider />");
    return ctx;
}

/**
 * ToastPortal — Positions and renders all active toasts
 */
function ToastPortal({ position, toasts, onDismiss }) {
    const posClass = {
        "top-right": "top-6 right-6 items-end",
        "top-left": "top-14 left-6 items-start",
        "bottom-right": "bottom-6 right-6 items-end",
        "bottom-left": "bottom-6 left-6 items-start",
        "top-center": "top-6 left-1/2 transform -translate-x-1/2 items-center",
        "bottom-center": "bottom-6 left-1/2 transform -translate-x-1/2 items-center",
    }[position];

    return (
        <div
            aria-live="polite"
            className={`fixed z-9999 flex flex-col gap-3 p-2 ${posClass}`}
        >
            <AnimatePresence>
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
}

/**
 * Toast Icons (SVG-based)
 */
function Icon({ variant }) {
    const base = "w-5 h-5";
    switch (variant) {
        case "success":
            return (
                <svg className={base} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 13l-3.5-3.5L5 8l3 3 6-6 1.5 1.5L8 13z" />
                </svg>
            );
        case "error":
            return (
                <svg className={base} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 8.586l4.95-4.95 1.414 1.414L11.414 10l4.95 4.95-1.414 1.414L10 11.414l-4.95 4.95-1.414-1.414L8.586 10 3.636 5.05 5.05 3.636 10 8.586z" />
                </svg>
            );
        case "warning":
            return (
                <svg className={base} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2l7 13H2L9 2zm1 11v2H8v-2h2zm0-6v4H8V7h2z" />
                </svg>
            );
        default:
            return (
                <svg className={base} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-1h2v1zm0-3H9V5h2v5z" />
                </svg>
            );
    }
}

/**
 * ToastItem — Individual toast component with timer + animation
 */
function ToastItem({ toast, onDismiss }) {
    const { title, description, variant, duration, pauseOnHover } = toast;
    const [paused, setPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const startRef = useRef(null);
    const rafRef = useRef(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        if (duration === null) return;

        const start = performance.now();
        startRef.current = start;

        const tick = (now) => {
            if (!mountedRef.current) return;
            if (paused) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }
            if (!startRef.current) startRef.current = now;
            const elapsed = now - startRef.current;
            const pct = Math.min(100, (elapsed / duration) * 100);
            setProgress(pct);
            if (elapsed >= duration) {
                onDismiss();
                return;
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            mountedRef.current = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [duration, paused, onDismiss]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onDismiss();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onDismiss]);

    const safeText = (val) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        if (val instanceof Error) return val.message;
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
    };

    const variantStyle = {
        success: "bg-emerald-600 text-white",
        error: "bg-rose-600 text-white",
        warning: "bg-amber-500 text-white",
        info: "bg-sky-600 text-white",
    }[variant];

    return (
        <motion.div
            role="status"
            aria-live="polite"
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            onMouseEnter={() => pauseOnHover && setPaused(true)}
            onMouseLeave={() => pauseOnHover && setPaused(false)}
            tabIndex={0}
            className={`w-full max-w-sm shadow-lg ${variantStyle} rounded-lg overflow-hidden`}
        >
            <div className="flex items-start gap-3 p-3">
                <div className="mt-0.5 text-current">
                    <Icon variant={variant} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm leading-tight truncate">
                        {safeText(title)}
                    </div>

                    <div className="text-xs mt-1 leading-snug opacity-90 truncate">
                        {safeText(description)}
                    </div>
                </div>
                <button
                    onClick={onDismiss}
                    aria-label="Dismiss notification"
                    className="ml-2 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition"
                >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
                        <path
                            d="M6 6l8 8M14 6L6 14"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            {duration !== null && (
                <div className="h-1 relative bg-black/10 dark:bg-white/10">
                    <div
                        className="absolute left-0 top-0 h-1 transition-[width] ease-linear"
                        style={{
                            width: `${progress}%`,
                            background:
                                "linear-gradient(90deg, rgba(0,0,0,0.15), rgba(0,0,0,0.05))",
                        }}
                    />
                </div>
            )}
        </motion.div>
    );
}

export default ToastProvider;