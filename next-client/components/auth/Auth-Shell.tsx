import Link from "next/link";
import type { ReactNode } from "react";
import { FiBarChart2, FiLock, FiPieChart } from "react-icons/fi";
import { cn } from "@/lib/utils/cn";

export interface AuthShellProps {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  className?: string;
  panelClassName?: string;
  contentClassName?: string;
  brandName?: string;
  brandHref?: string;
  sideTitle?: ReactNode;
  sideDescription?: ReactNode;
}

export default function AuthShell({
  children,
  title = "Login",
  description = "Welcome back. Please enter your details to access your account.",
  footer,
  className,
  panelClassName,
  contentClassName,
  brandName = "Shimanto Store",
  brandHref = "/",
  sideTitle = "Manage your shopping better",
  sideDescription = "Track orders, monitor activity, and manage your account from one secure place.",
}: AuthShellProps) {
  return (
    <main
      className={cn(
        "relative min-h-screen overflow-hidden bg-[#eef2ff] text-slate-900 dark:bg-[#050816] dark:text-slate-50",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-[42vh] bg-[#3f51f7] dark:bg-[#0f172a]" />
      <div className="absolute inset-x-0 bottom-0 h-[58vh] bg-[#e9edff] dark:bg-[#020617]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section
          className={cn(
            "grid w-full max-w-5xl overflow-hidden rounded-4xl bg-white shadow-[0_30px_80px_rgba(43,62,144,0.18)] dark:border dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_30px_80px_rgba(2,6,23,0.65)] lg:grid-cols-2",
            panelClassName,
          )}
        >
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md">
              <Link
                href={brandHref}
                className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3f51f7] text-white">
                  <FiLock className="h-4 w-4" />
                </span>
                {brandName}
              </Link>

              <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
                  {title}
                </h1>
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-300 sm:text-base">
                  {description}
                </p>
              </div>

              <div className={cn("space-y-5", contentClassName)}>
                {children}

                {footer ? (
                  <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
                    {footer}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative hidden bg-slate-50 dark:bg-slate-900 lg:flex">
            <div className="absolute inset-y-0 left-0 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex w-full flex-col items-center justify-center p-12">
              <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center">
                <div className="relative mb-8 flex h-64 w-full items-center justify-center">
                  <div className="absolute h-52 w-52 rounded-full bg-[#3f51f7]/10 blur-2xl" />

                  <div className="relative flex items-center justify-center">
                    <div className="absolute -left-16 top-10 rounded-2xl bg-white p-4 shadow-lg dark:border dark:border-slate-800 dark:bg-slate-950">
                      <FiPieChart className="h-8 w-8 text-[#3f51f7]" />
                    </div>

                    <div className="absolute -right-14 bottom-8 rounded-2xl bg-white p-4 shadow-lg dark:border dark:border-slate-800 dark:bg-slate-950">
                      <FiBarChart2 className="h-8 w-8 text-[#3f51f7]" />
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                      <div className="w-56 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="h-3 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
                          <div className="h-3 w-10 rounded-full bg-[#3f51f7]/30" />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="h-16 rounded-2xl bg-[#3f51f7]" />
                          <div className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                          <div className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                        </div>

                        <div className="space-y-2">
                          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
                          <div className="h-3 w-4/5 rounded-full bg-slate-100 dark:bg-slate-800" />
                          <div className="h-3 w-2/3 rounded-full bg-slate-100 dark:bg-slate-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                    {sideTitle}
                  </h2>
                  <p className="mx-auto max-w-sm text-sm leading-7 text-slate-500 dark:text-slate-300">
                    {sideDescription}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2">
                  <span className="h-1.5 w-10 rounded-full bg-[#3f51f7]" />
                  <span className="h-1.5 w-10 rounded-full bg-[#cfd6ff] dark:bg-slate-700" />
                  <span className="h-1.5 w-10 rounded-full bg-[#cfd6ff] dark:bg-slate-700" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
