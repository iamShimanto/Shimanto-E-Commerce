import React from "react";

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 outline-none select-none " +
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "active:scale-[0.98]";

const variantStyles = {
    primary:
        "bg-zinc-900 text-white hover:bg-zinc-800 " +
        "dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",

    secondary:
        "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200 " +
        "dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:border-zinc-700",

    outline:
        "border border-zinc-300 bg-transparent text-zinc-900 hover:bg-zinc-100 " +
        "dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800",

    ghost:
        "bg-transparent text-zinc-900 hover:bg-zinc-100 " +
        "dark:text-zinc-100 dark:hover:bg-zinc-800",

    danger:
        "bg-red-600 text-white hover:bg-red-700 " +
        "dark:bg-red-500 dark:text-white dark:hover:bg-red-600",

    success:
        "bg-emerald-600 text-white hover:bg-emerald-700 " +
        "dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600",
};

const sizeStyles = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
    icon: "h-10 w-10 p-0",
};

function Spinner({ className = "" }) {
    return (
        <svg
            className={cn("h-4 w-4 animate-spin", className)}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="4"
            />
            <path
                d="M22 12a10 10 0 0 1-10 10"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    );
}

const Button = React.forwardRef(function Button(
    {
        children,
        className = "",
        variant = "primary",
        size = "md",
        type = "button",
        loading = false,
        disabled = false,
        fullWidth = false,
        leftIcon = null,
        rightIcon = null,
        ...props
    },
    ref
) {
    const isDisabled = disabled || loading;

    return (
        <button
            ref={ref}
            type={type}
            disabled={isDisabled}
            className={cn(
                baseStyles,
                variantStyles[variant] || variantStyles.primary,
                sizeStyles[size] || sizeStyles.md,
                fullWidth && "w-full",
                className
            )}
            {...props}
        >
            {loading ? (
                <>
                    <Spinner />
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
                    {children ? <span>{children}</span> : null}
                    {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
                </>
            )}
        </button>
    );
});

export default Button;