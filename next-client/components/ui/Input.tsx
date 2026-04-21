"use client";

import React from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type InputSize = "sm" | "md" | "lg";
type InputVariant = "default" | "filled" | "ghost";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  size?: InputSize;
  variant?: InputVariant;
  fullWidth?: boolean;
}

const sizeStyles: Record<InputSize, string> = {
  sm: "h-9 rounded-xl px-3 text-sm",
  md: "h-11 rounded-xl px-4 text-sm",
  lg: "h-12 rounded-2xl px-4 text-base",
};

const variantStyles: Record<InputVariant, string> = {
  default:
    "border border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 shadow-sm focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-200",
  filled:
    "border border-transparent bg-slate-100 text-slate-950 placeholder:text-slate-400 focus:border-slate-950 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-200",
  ghost:
    "border border-transparent bg-transparent text-slate-950 placeholder:text-slate-400 focus:border-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-200",
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      helperText,
      error,
      startIcon,
      endIcon,
      wrapperClassName,
      labelClassName,
      helperTextClassName,
      size = "md",
      variant = "default",
      fullWidth = true,
      className,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const helperTextId = helperText ? `${inputId}-help` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy =
      [helperTextId, errorId].filter(Boolean).join(" ") || undefined;
    const hasError = Boolean(error);

    return (
      <div className={cn("space-y-2", fullWidth && "w-full", wrapperClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-200",
              labelClassName,
            )}
          >
            <span>{label}</span>
            {required ? <span className="text-rose-500">*</span> : null}
          </label>
        ) : null}

        <div className="relative">
          {startIcon ? (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-slate-500">
              {startIcon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={cn(
              "block w-full appearance-none transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-slate-950/10 dark:focus:ring-slate-50/10",
              "disabled:cursor-not-allowed disabled:opacity-60",
              "placeholder:transition-colors",
              sizeStyles[size],
              variantStyles[variant],
              hasError &&
                "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-400",
              startIcon && "pl-10",
              endIcon && "pr-10",
              className,
            )}
            {...props}
          />

          {endIcon ? (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 dark:text-slate-500">
              {endIcon}
            </span>
          ) : null}
        </div>

        {helperText || error ? (
          <p
            id={error ? errorId : helperTextId}
            className={cn(
              "text-sm leading-6",
              hasError
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-500 dark:text-slate-400",
              helperTextClassName,
            )}
          >
            {error ?? helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
