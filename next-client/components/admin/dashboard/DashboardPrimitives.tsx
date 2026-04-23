import Link from "next/link";

import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

function StatusPill({ value }: { value?: string | null }) {
  const status = String(value ?? "").toLowerCase();
  const toneClass =
    status === "paid" || status === "delivered"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200"
      : status === "pending"
        ? "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200"
        : status === "failed" || status === "cancelled"
          ? "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200"
          : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/80";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
        toneClass,
      )}
    >
      {value || "unknown"}
    </span>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent = "neutral",
}: {
  label: string;
  value: string;
  hint: string;
  accent?: "neutral" | "info" | "success" | "warning" | "danger";
}) {
  const accents = {
    neutral:
      "border-slate-200 bg-white text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-white",
    info: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200",
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
    warning:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200",
    danger:
      "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200",
  };

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
      <div className="text-xs font-semibold text-(--text-muted)">{label}</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-(--text)">
        {value}
      </div>
      <div
        className={cn(
          "mt-3 inline-flex rounded-xl border px-3 py-1.5 text-xs font-bold",
          accents[accent],
        )}
      >
        {hint}
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold tracking-tight text-(--text)">
            {title}
          </div>
          {subtitle ? (
            <div className="text-xs font-semibold text-(--text-muted)">
              {subtitle}
            </div>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ListRow({
  title,
  subtitle,
  meta,
  right,
  accent = "neutral",
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  right?: ReactNode;
  accent?: "neutral" | "info" | "success" | "warning" | "danger";
}) {
  const accents = {
    neutral: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/80",
    info: "bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200",
    success:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200",
    warning:
      "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200",
    danger: "bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200",
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-(--border) bg-(--surface-2) px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="truncate text-sm font-extrabold text-(--text)">
          {title}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-(--text-muted)">
          {meta ? (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em]",
                accents[accent],
              )}
            >
              {meta}
            </span>
          ) : null}
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
      </div>
      {right ? (
        <div className="text-sm font-bold text-(--text)">{right}</div>
      ) : null}
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-(--border) px-3 py-6 text-center text-sm font-semibold text-(--text-muted)">
      {children}
    </div>
  );
}

function InfoCard({
  title,
  value,
  Icon,
  tone = "blue",
}: {
  title: string;
  value: string;
  Icon: ComponentType<{ size?: number }>;
  tone?: "blue" | "green" | "amber";
}) {
  const tones = {
    blue: "border-sky-200/70 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200",
    green:
      "border-emerald-200/70 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
    amber:
      "border-amber-200/70 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200",
  };

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-(--text-muted)">
            {title}
          </div>
          <div className="mt-1 text-2xl font-extrabold tracking-tight text-(--text)">
            {value}
          </div>
        </div>
        <div className={cn("rounded-xl border p-2", tones[tone])}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: ComponentType<{ size?: number }>;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm font-extrabold text-(--text) transition hover:opacity-90"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-(--border) bg-(--surface)">
        <Icon size={18} />
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}

export {
  EmptyState,
  InfoCard,
  ListRow,
  Panel,
  QuickActionCard,
  StatCard,
  StatusPill,
};
