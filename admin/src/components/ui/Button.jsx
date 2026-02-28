import { forwardRef } from "react"

import { cn } from "../../lib/cn"

const VARIANT_STYLES = {
    primary:
        "bg-(--primary) text-white shadow-sm hover:bg-(--primary-hover)",
    secondary:
        "border border-(--border) bg-(--surface) text-(--text) shadow-sm hover:bg-(--surface-2)",
    ghost:
        "text-(--text-muted) hover:bg-(--surface-2) hover:text-(--text)",
    danger: "text-rose-700 hover:bg-rose-50",
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
                "inline-flex items-center justify-center gap-2 font-extrabold transition",
                "focus:outline-none focus:ring-4 focus:ring-(--focus-ring)",
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
