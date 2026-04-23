import Link from "next/link";
import { FiArrowRight, FiHome, FiShoppingBag, FiSlash } from "react-icons/fi";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen items-center overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 28%), radial-gradient(circle at top right, rgba(251, 146, 60, 0.16), transparent 24%), linear-gradient(180deg, #020617 0%, #0f172a 55%, #111827 100%)",
        }}
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/70 backdrop-blur-md">
          <FiSlash className="h-4 w-4" />
          Page not found
        </div>

        <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-4xl font-bold text-white shadow-lg shadow-slate-950/30 backdrop-blur-md">
          404
        </div>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          This page is missing.
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
          The link may be broken or the page may have moved.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
          >
            <FiHome className="h-4 w-4" />
            Go home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
          >
            <FiShoppingBag className="h-4 w-4" />
            Browse products
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}