import { forwardRef } from "react"

import { cn } from "../../lib/cn"

function isAriaInvalid(value) {
    return value === true || value === "true"
}

const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
    const invalid = isAriaInvalid(props["aria-invalid"])

    return (
        <textarea
            ref={ref}
            {...props}
            className={cn(
                "min-h-26 w-full resize-none rounded-2xl border bg-(--surface) px-4 py-3 text-sm font-semibold shadow-sm shadow-black/5",
                "text-(--text) placeholder:text-(--text-muted)",
                "border-(--border) outline-none focus:ring-[3px] focus:ring-(--focus-ring)",
                invalid && "border-rose-300 focus:ring-rose-200",
                className
            )}
        />
    )
})

export default Textarea
export { Textarea }
