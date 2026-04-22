"use client";

import React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loadingLabel?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-slate-950 text-white shadow-sm hover:bg-slate-800 focus-visible:ring-slate-950 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-white",
  secondary:
    "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 focus-visible:ring-slate-400 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
  outline:
    "border border-slate-300 bg-transparent text-slate-950 hover:bg-slate-100 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:hover:bg-slate-900",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
  destructive:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-500 focus-visible:ring-rose-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 rounded-full px-3 text-sm",
  md: "h-11 rounded-full px-4 text-sm",
  lg: "h-12 rounded-full px-5 text-base",
  icon: "h-11 w-11 rounded-full p-0",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      loading = false,
      fullWidth = false,
      startIcon,
      endIcon,
      loadingLabel = "Loading...",
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const hasIconOnly = size === "icon" && !children;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-950",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          hasIconOnly && "justify-center",
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
            <span>{loadingLabel}</span>
          </>
        ) : (
          <>
            {startIcon ? <span className="inline-flex shrink-0">{startIcon}</span> : null}
            <span>{children ?? "Button"}</span>
            {endIcon ? <span className="inline-flex shrink-0">{endIcon}</span> : null}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;