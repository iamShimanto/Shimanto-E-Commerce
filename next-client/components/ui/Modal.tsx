"use client";

import React, { useEffect, useId, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { cn } from "@/lib/utils/cn";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  closeButtonLabel?: string;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)]",
};

export default function Modal({
  open,
  onOpenChange,
  children,
  title,
  description,
  footer,
  size = "md",
  className,
  overlayClassName,
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  closeButtonLabel = "Close dialog",
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const previousBodyOverflow = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousBodyOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      if (previousBodyOverflow.current !== null) {
        document.body.style.overflow = previousBodyOverflow.current;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEsc) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnEsc, onOpenChange, open]);

  const portalTarget = useMemo(() => {
    if (typeof document === "undefined") {
      return null;
    }

    return document.body;
  }, []);

  if (!open || !portalTarget) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Dismiss dialog overlay"
        onClick={() => {
          if (closeOnOverlayClick) {
            onOpenChange(false);
          }
        }}
        className={cn(
          "absolute inset-0 cursor-default bg-slate-950/60 backdrop-blur-[2px] transition-opacity duration-200",
          overlayClassName,
        )}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_30px_120px_-40px_rgba(15,23,42,0.5)] outline-none dark:border-slate-800 dark:bg-slate-950",
          sizeStyles[size],
          contentClassName,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div className={cn("min-w-0 space-y-1", headerClassName)}>
            {title ? (
              <h2
                id={titleId}
                className="text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-50"
              >
                {title}
              </h2>
            ) : null}

            {description ? (
              <p
                id={descriptionId}
                className="text-sm leading-6 text-slate-600 dark:text-slate-300"
              >
                {description}
              </p>
            ) : null}
          </div>

          {showCloseButton ? (
            <button
              type="button"
              aria-label={closeButtonLabel}
              onClick={() => onOpenChange(false)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950/10 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-50"
            >
              <FiX className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <div className={cn("px-5 py-5 sm:px-6", bodyClassName)}>{children}</div>

        {footer ? (
          <div
            className={cn(
              "border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6",
              footerClassName,
            )}
          >
            {footer}
          </div>
        ) : null}
      </section>
    </div>,
    portalTarget,
  );
}
