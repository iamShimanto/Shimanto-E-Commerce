import React, { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx, { } from "clsx"

const inputSizes = {
    sm: "h-9 px-3 text-sm rounded-lg",
    md: "h-11 px-4 text-sm rounded-xl",
    lg: "h-12 px-4 text-base rounded-xl",
};

const Input = forwardRef(
    (
        {
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            type = "text",
            size = "md",
            className = "",
            inputClassName = "",
            containerClassName = "",
            id,
            required = false,
            disabled = false,
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const inputId = id || generatedId;
        const [showPassword, setShowPassword] = useState(false);

        const isPassword = type === "password";
        const resolvedType = isPassword
            ? showPassword
                ? "text"
                : "password"
            : type;

        return (
            <div className={clsx("w-full", containerClassName)}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        {label}
                        {required && <span className="ml-1 text-red-500">*</span>}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                            {leftIcon}
                        </span>
                    )}

                    <input
                        id={inputId}
                        ref={ref}
                        type={resolvedType}
                        disabled={disabled}
                        aria-invalid={!!error}
                        aria-describedby={
                            error
                                ? `${inputId}-error`
                                : helperText
                                    ? `${inputId}-helper`
                                    : undefined
                        }
                        className={clsx(
                            "w-full border bg-white text-slate-900 outline-none transition-all duration-200",
                            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                            "dark:bg-slate-950 dark:text-slate-100",
                            "disabled:cursor-not-allowed disabled:opacity-60",
                            "focus:ring-4",
                            inputSizes[size],
                            leftIcon && "pl-10",
                            (rightIcon || isPassword) && "pr-11",
                            error
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500"
                                : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/10 dark:border-slate-700 dark:focus:border-slate-300 dark:focus:ring-slate-100/10",
                            className,
                            inputClassName
                        )}
                        {...props}
                    />

                    {isPassword ? (
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            tabIndex={-1}
                        >
                            {showPassword ? size === "sm" ? <EyeOff size={16} /> : <EyeOff size={18} /> : size === "sm" ? <Eye size={16} /> : <Eye size={18} />}
                        </button>
                    ) : rightIcon ? (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500">
                            {rightIcon}
                        </span>
                    ) : null}
                </div>

                {error ? (
                    <p
                        id={`${inputId}-error`}
                        className="mt-2 text-sm text-red-500 dark:text-red-400"
                    >
                        {error}
                    </p>
                ) : helperText ? (
                    <p
                        id={`${inputId}-helper`}
                        className="mt-2 text-sm text-slate-500 dark:text-slate-400"
                    >
                        {helperText}
                    </p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;