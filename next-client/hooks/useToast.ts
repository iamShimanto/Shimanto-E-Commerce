"use client";

import React from "react";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiLoader,
  FiX,
  FiXCircle,
} from "react-icons/fi";

export type ToastKind =
  | "default"
  | "success"
  | "error"
  | "info"
  | "warning"
  | "loading";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastPayload {
  title: string;
  description?: string;
  kind?: ToastKind;
  icon?: React.ReactNode;
  duration?: number;
  action?: ToastAction;
}

export interface ToastPromiseMessages<T> {
  loading: ToastPayload;
  success: ToastPayload | ((value: T) => ToastPayload);
  error: ToastPayload | ((error: unknown) => ToastPayload);
}

export interface UseToastReturn {
  show: (payload: ToastPayload) => string;
  success: (
    title: string,
    description?: string,
    payload?: Omit<ToastPayload, "title" | "description" | "kind">,
  ) => string;
  error: (
    title: string,
    description?: string,
    payload?: Omit<ToastPayload, "title" | "description" | "kind">,
  ) => string;
  info: (
    title: string,
    description?: string,
    payload?: Omit<ToastPayload, "title" | "description" | "kind">,
  ) => string;
  warning: (
    title: string,
    description?: string,
    payload?: Omit<ToastPayload, "title" | "description" | "kind">,
  ) => string;
  loading: (
    title: string,
    description?: string,
    payload?: Omit<ToastPayload, "title" | "description" | "kind">,
  ) => string;
  promise: <T>(
    promise: Promise<T>,
    messages: ToastPromiseMessages<T>,
  ) => Promise<T>;
  dismiss: (toastId?: string) => void;
}

type VariantMeta = {
  badgeClass: string;
  ringClass: string;
  icon: React.ReactNode;
};

function variantMeta(kind: ToastKind): VariantMeta {
  switch (kind) {
    case "success":
      return {
        badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
        ringClass: "from-emerald-500/12 via-emerald-500/4 to-transparent",
        icon: React.createElement(FiCheckCircle, {
          className: "h-5 w-5 shrink-0",
        }),
      };
    case "error":
      return {
        badgeClass: "bg-rose-50 text-rose-600 border-rose-200",
        ringClass: "from-rose-500/12 via-rose-500/4 to-transparent",
        icon: React.createElement(FiXCircle, {
          className: "h-5 w-5 shrink-0",
        }),
      };
    case "warning":
      return {
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        ringClass: "from-amber-500/12 via-amber-500/4 to-transparent",
        icon: React.createElement(FiAlertTriangle, {
          className: "h-5 w-5 shrink-0",
        }),
      };
    case "loading":
      return {
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        ringClass: "from-slate-500/12 via-slate-500/4 to-transparent",
        icon: React.createElement(FiLoader, {
          className: "h-5 w-5 shrink-0 animate-spin",
        }),
      };
    case "info":
      return {
        badgeClass: "bg-sky-50 text-sky-600 border-sky-200",
        ringClass: "from-sky-500/12 via-sky-500/4 to-transparent",
        icon: React.createElement(FiInfo, {
          className: "h-5 w-5 shrink-0",
        }),
      };
    default:
      return {
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        ringClass: "from-slate-500/12 via-slate-500/4 to-transparent",
        icon: React.createElement(FiAlertCircle, {
          className: "h-5 w-5 shrink-0",
        }),
      };
  }
}

function getToastPayload<T>(
  input: ToastPayload | ((value: T) => ToastPayload),
  value: T,
): ToastPayload {
  return typeof input === "function" ? input(value) : input;
}

function ToastCard({
  id,
  visible,
  payload,
}: {
  id: string;
  visible: boolean;
  payload: ToastPayload;
}) {
  const kind = payload.kind ?? "default";
  const meta = variantMeta(kind);
  const icon = payload.icon ?? meta.icon;

  return React.createElement(
    "div",
    {
      className: [
        "pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 text-slate-950 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-all duration-200",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      ].join(" "),
    },
    React.createElement("div", {
      className: [
        "absolute inset-0 bg-gradient-to-r opacity-100",
        meta.ringClass,
      ].join(" "),
    }),
    React.createElement(
      "div",
      { className: "relative flex gap-3 px-4 py-4" },
      React.createElement(
        "div",
        {
          className: [
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
            meta.badgeClass,
          ].join(" "),
        },
        icon,
      ),
      React.createElement(
        "div",
        { className: "min-w-0 flex-1" },
        React.createElement(
          "div",
          { className: "flex items-start gap-3" },
          React.createElement(
            "div",
            { className: "min-w-0 flex-1" },
            React.createElement(
              "p",
              {
                className:
                  "truncate text-sm font-semibold leading-6 text-slate-950",
              },
              payload.title,
            ),
            payload.description
              ? React.createElement(
                  "p",
                  { className: "mt-1 text-sm leading-6 text-slate-600" },
                  payload.description,
                )
              : null,
          ),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => toast.dismiss(id),
              className:
                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700",
              "aria-label": "Dismiss toast",
            },
            React.createElement(FiX, { className: "h-4 w-4" }),
          ),
        ),
        payload.action
          ? React.createElement(
              "div",
              { className: "mt-3 flex items-center justify-start gap-2" },
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: payload.action.onClick,
                  className:
                    "inline-flex items-center rounded-full bg-slate-950 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800",
                },
                payload.action.label,
              ),
            )
          : null,
      ),
    ),
  );
}

function showToast(payload: ToastPayload) {
  return toast.custom(
    (t) =>
      React.createElement(ToastCard, {
        id: t.id,
        visible: t.visible,
        payload,
      }),
    {
      duration:
        payload.duration ?? (payload.kind === "loading" ? Infinity : 4500),
    },
  );
}

export function useToast(): UseToastReturn {
  return {
    show: showToast,
    success: (title, description, payload) =>
      showToast({ ...payload, title, description, kind: "success" }),
    error: (title, description, payload) =>
      showToast({ ...payload, title, description, kind: "error" }),
    info: (title, description, payload) =>
      showToast({ ...payload, title, description, kind: "info" }),
    warning: (title, description, payload) =>
      showToast({ ...payload, title, description, kind: "warning" }),
    loading: (title, description, payload) =>
      showToast({
        ...payload,
        title,
        description,
        kind: "loading",
        duration: Infinity,
      }),
    promise: async <T>(
      promise: Promise<T>,
      messages: ToastPromiseMessages<T>,
    ) => {
      const loadingPayload = messages.loading;
      const loadingToastId = showToast({
        ...loadingPayload,
        kind: loadingPayload.kind ?? "loading",
        duration: Infinity,
      });

      try {
        const result = await promise;
        const successPayload = getToastPayload(messages.success, result);

        toast.dismiss(loadingToastId);
        showToast({
          ...successPayload,
          kind: successPayload.kind ?? "success",
        });

        return result;
      } catch (error) {
        const errorPayload = getToastPayload(messages.error, error);

        toast.dismiss(loadingToastId);
        showToast({
          ...errorPayload,
          kind: errorPayload.kind ?? "error",
        });

        throw error;
      }
    },
    dismiss: (toastId?: string) => toast.dismiss(toastId),
  };
}
