import { forwardRef } from "react"

import { cn } from "../../lib/cn"

const VARIANT_STYLES = {
    primary:
        "bg-(--primary) text-white shadow-sm shadow-black/10 ring-1 ring-black/5 hover:bg-(--primary-hover) hover:shadow-md hover:shadow-black/15",
    secondary:
        "border border-(--border) bg-(--surface) text-(--text) shadow-sm shadow-black/5 ring-1 ring-black/3 hover:bg-(--surface-2) hover:shadow-md hover:shadow-black/10",
    ghost:
        "text-(--text-muted) hover:bg-(--surface-2) hover:text-(--text)",
    danger: "text-rose-700 ring-1 ring-rose-200/60 hover:bg-rose-50",
}

const SIZE_STYLES = {
    sm: "rounded-xl px-3 py-2 text-xs",
    md: "rounded-2xl px-4 py-3 text-sm",
    lg: "rounded-2xl px-5 py-3.5 text-sm",
    icon: "rounded-2xl p-2",
}

const Button = forwardRef(function Button(
    { variant = "primary", size = "md", className, type = "button", ...props },
    ref
) {
    return (
        <button
            ref={ref}
            type={type}
            className={cn(
                "inline-flex items-center justify-center gap-2 font-extrabold transition duration-200",
                "focus:outline-none focus:ring-[3px] focus:ring-(--focus-ring)",
                "active:translate-y-px",
                "disabled:cursor-not-allowed disabled:opacity-50",
                VARIANT_STYLES[variant] || VARIANT_STYLES.primary,
                SIZE_STYLES[size] || SIZE_STYLES.md,
                className
            )}
            {...props}
        />
    )
})

export default Button
export { Button }
