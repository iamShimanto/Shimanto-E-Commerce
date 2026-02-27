import { Toaster } from "react-hot-toast"
import ThemeToggle from "./components/ui/ThemeToggle"
import { useToast } from "./hooks/useToast"
import { useTheme } from "./hooks/useTheme"

function App() {
  const toast = useToast()
  const { isDark, toggle } = useTheme()
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="min-h-dvh p-6">
        <div className="flex items-center justify-end">
          <ThemeToggle isDark={isDark} onToggle={toggle} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-black/10 transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
            onClick={() => toast.success("Success", "Product added")}
          >
            Success
          </button>

          <button
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-black/10 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:ring-white/10 dark:hover:bg-slate-800"
            onClick={() => toast.error("Oops", "Something went wrong")}
          >
            Error
          </button>

          <button
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-black/10 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:ring-white/10 dark:hover:bg-slate-800"
            onClick={() => toast.info("Heads up", "New update available")}
          >
            Info
          </button>

          <button
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-black/10 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:ring-white/10 dark:hover:bg-slate-800"
            onClick={() => toast.warning("Warning", "Low stock")}
          >
            Warning
          </button>
        </div>
      </div>

    </>
  )
}

export default App
