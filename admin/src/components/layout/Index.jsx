import { Outlet } from "react-router"
import { useMemo, useState } from "react"

import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import { useTheme } from "../../hooks/useTheme"

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isDark, toggle } = useTheme()

  const shellStyle = useMemo(
    () => ({
      backgroundColor: "var(--bg)",
      color: "var(--text)",
    }),
    []
  )

  return (
    <div className="min-h-dvh" style={shellStyle}>
      <div className="mx-auto flex max-w-full">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="min-w-0 flex-1">
          <Topbar
            onOpenSidebar={() => setMobileOpen(true)}
            isDark={isDark}
            onToggleTheme={toggle}
          />

          <main className="px-4 py-5 sm:px-6 sm:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}