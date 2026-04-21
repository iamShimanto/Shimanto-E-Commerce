"use client";

import React from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "@/lib/utils/cn";

type SelectSize = "sm" | "md" | "lg";
type SelectVariant = "default" | "filled" | "ghost";

export interface SelectOption {
  label: ReactNode;
  value: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size" | "value" | "defaultValue" | "onChange"> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  options?: SelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  size?: SelectSize;
  variant?: SelectVariant;
  fullWidth?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

const sizeStyles: Record<SelectSize, string> = {
  sm: "h-9 rounded-xl px-3 text-sm",
  md: "h-11 rounded-xl px-4 text-sm",
  lg: "h-12 rounded-2xl px-4 text-base",
};

const variantStyles: Record<SelectVariant, string> = {
  default:
    "border border-slate-300 bg-white text-slate-950 shadow-sm focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-200",
  filled:
    "border border-transparent bg-slate-100 text-slate-950 focus:border-slate-950 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-slate-200",
  ghost:
    "border border-transparent bg-transparent text-slate-950 focus:border-slate-950 dark:text-slate-50 dark:focus:border-slate-200",
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      helperText,
      error,
      options,
      placeholder,
      wrapperClassName,
      labelClassName,
      helperTextClassName,
      size = "md",
      variant = "default",
      fullWidth = true,
      className,
      disabled,
      required,
      value,
      defaultValue,
      onValueChange,
      onChange,
      children,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const helperTextId = helperText ? `${selectId}-help` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;
    const describedBy = [helperTextId, errorId].filter(Boolean).join(" ") || undefined;
    const hasError = Boolean(error);
    const hasExplicitValue = value !== undefined;

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      onValueChange?.(event.target.value);
      onChange?.(event);
    };

    return (
      <div className={cn("space-y-2", fullWidth && "w-full", wrapperClassName)}>
        {label ? (
          <label
            htmlFor={selectId}
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
          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            value={hasExplicitValue ? value : undefined}
            defaultValue={hasExplicitValue ? undefined : defaultValue}
            onChange={handleChange}
            className={cn(
              "block w-full appearance-none pr-10 transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-slate-950/10 dark:focus:ring-slate-50/10",
              "disabled:cursor-not-allowed disabled:opacity-60",
              sizeStyles[size],
              variantStyles[variant],
              hasError &&
                "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-400",
              className,
            )}
            {...props}
          >
            {placeholder ? (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            ) : null}

            {options?.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}

            {children}
          </select>

          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 dark:text-slate-500">
            <FiChevronDown className="h-4 w-4" />
          </span>
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

Select.displayName = "Select";

export default Select;