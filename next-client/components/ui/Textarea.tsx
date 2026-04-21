"use client";

import React from "react";
import type { TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type TextareaSize = "sm" | "md" | "lg";
type TextareaVariant = "default" | "filled" | "ghost";
type TextareaResize = "none" | "vertical" | "horizontal" | "both";

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  size?: TextareaSize;
  variant?: TextareaVariant;
  resize?: TextareaResize;
  fullWidth?: boolean;
}

const sizeStyles: Record<TextareaSize, string> = {
  sm: "min-h-24 rounded-xl px-3 py-2 text-sm",
  md: "min-h-28 rounded-xl px-4 py-3 text-sm",
  lg: "min-h-32 rounded-2xl px-4 py-3 text-base",
};

const variantStyles: Record<TextareaVariant, string> = {
  default:
    "border border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 shadow-sm focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-200",
  filled:
    "border border-transparent bg-slate-100 text-slate-950 placeholder:text-slate-400 focus:border-slate-950 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-200",
  ghost:
    "border border-transparent bg-transparent text-slate-950 placeholder:text-slate-400 focus:border-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-200",
};

const resizeStyles: Record<TextareaResize, string> = {
  none: "resize-none",
  vertical: "resize-y",
  horizontal: "resize-x",
  both: "resize",
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      helperText,
      error,
      wrapperClassName,
      labelClassName,
      helperTextClassName,
      size = "md",
      variant = "default",
      resize = "vertical",
      fullWidth = true,
      className,
      disabled,
      required,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const helperTextId = helperText ? `${textareaId}-help` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const describedBy =
      [helperTextId, errorId].filter(Boolean).join(" ") || undefined;
    const hasError = Boolean(error);

    return (
      <div className={cn("space-y-2", fullWidth && "w-full", wrapperClassName)}>
        {label ? (
          <label
            htmlFor={textareaId}
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-200",
              labelClassName,
            )}
          >
            <span>{label}</span>
            {required ? <span className="text-rose-500">*</span> : null}
          </label>
        ) : null}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(
            "block w-full transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-slate-950/10 dark:focus:ring-slate-50/10",
            "disabled:cursor-not-allowed disabled:opacity-60",
            sizeStyles[size],
            variantStyles[variant],
            resizeStyles[resize],
            hasError &&
              "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-400",
            className,
          )}
          {...props}
        />

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

Textarea.displayName = "Textarea";

export default Textarea;
