import { Bell, Menu, Search } from "lucide-react"

import ThemeToggle from "../ui/ThemeToggle"
import Button from "../ui/Button"
import { cn } from "../../lib/cn"

export default function Topbar({ onOpenSidebar, isDark, onToggleTheme }) {
    return (
        <header className="sticky top-0 z-40 border-b border-(--border) bg-(--surface)/85 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onOpenSidebar}
                    className="lg:hidden"
                    aria-label="Open sidebar"
                >
                    <Menu size={18} />
                </Button>

                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="hidden sm:block">
                        <div className="text-sm font-extrabold tracking-tight">Dashboard</div>
                        <div className="text-xs font-medium text-(--text-muted)">
                            Manage products, orders and customers
                        </div>
                    </div>

                    <div className="ml-auto flex w-full max-w-130 items-center gap-2 rounded-2xl border border-(--border) bg-(--surface-2) px-3 py-2 shadow-sm sm:ml-6">
                        <Search size={16} className="text-(--text-muted)" />
                        <input
                            className={cn(
                                "w-full bg-transparent text-sm font-semibold text-(--text)",
                                "placeholder:text-(--text-muted) focus:outline-none"
                            )}
                            placeholder="Search orders, products..."
                            aria-label="Search"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="relative h-10 w-10 text-(--text-muted) hover:text-(--text)"
                        aria-label="Notifications"
                    >
                        <Bell size={18} />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-(--primary)" />
                    </Button>

                    <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

                    <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) px-3 py-2 shadow-sm">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-(--surface-2) text-xs font-extrabold ring-1 ring-(--border)">
                            SA
                        </div>
                        <div className="leading-tight">
                            <div className="text-xs font-extrabold">Super Admin</div>
                            <div className="text-[11px] font-semibold text-(--text-muted)">
                                Online
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
