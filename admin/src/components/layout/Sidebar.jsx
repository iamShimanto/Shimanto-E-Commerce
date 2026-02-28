import { NavLink } from "react-router"
import {
    BarChart3,
    Boxes,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    User,
    Settings,
    ShoppingCart,
    Users,
    X,
} from "lucide-react"

import { useDispatch } from "react-redux"
import { useNavigate } from "react-router"

import { cn } from "../../lib/cn"
import Button from "../ui/Button"
import { useToast } from "../../hooks/useToast"
import { authApi, useLogoutMutation, useProfileQuery } from "../../store/auth/authApi"

const navItems = [
    { to: "/", label: "Dashboard", Icon: LayoutDashboard, end: true },
    { to: "/orders", label: "Orders", Icon: ClipboardList },
    { to: "/products", label: "Products", Icon: Boxes },
    { to: "/categories", label: "Categories", Icon: BarChart3 },
    { to: "/customers", label: "Customers", Icon: Users },
    { to: "/cart", label: "Cart", Icon: ShoppingCart },
    { to: "/profile", label: "Profile", Icon: User },
    { to: "/settings", label: "Settings", Icon: Settings },
]

function SidebarLink({ to, label, Icon: NavIcon, end, onNavigate }) {
    return (
        <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
                cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
                    "text-(--text-muted) hover:bg-(--surface-2) hover:text-(--text)",
                    isActive &&
                    "bg-(--surface-2) text-(--text) ring-1 ring-(--border)"
                )
            }
        >
            <NavIcon
                size={18}
                className="opacity-85 transition group-hover:opacity-100"
            />
            <span className="truncate">{label}</span>
        </NavLink>
    )
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const toast = useToast()

    const { data: user } = useProfileQuery()
    const [triggerLogout, { isLoading: isLoggingOut }] = useLogoutMutation()

    const displayName = user?.fullName || "Admin"
    const displayEmail = user?.email || "contact@shimanto.dev"

    const onLogout = async () => {
        try {
            await triggerLogout().unwrap()
        } catch (error) {
            const message =
                error?.data?.message ||
                error?.data?.error ||
                (typeof error === "string" ? error : null) ||
                "Logout failed"
            toast.error("Logout failed", message)
        } finally {
            dispatch(authApi.util.resetApiState())
            navigate("/login", { replace: true })
            toast.success("Logged out")
            onMobileClose?.()
        }
    }

    return (
        <>
            {/* Desktop */}
            <aside className="hidden h-dvh w-70 shrink-0 border-r border-(--border) bg-(--surface) lg:block">
                <div className="flex h-full flex-col">
                    <div className="flex items-center gap-3 px-5 py-5">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-(--primary) text-white shadow-sm">
                            <LayoutDashboard size={18} />
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-lg font-extrabold tracking-tight">
                                Admin
                            </div>
                            <div className="truncate text-xs font-medium text-(--text-muted)">
                                Dashboard
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-3">
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <SidebarLink key={item.to} {...item} />
                            ))}
                        </div>
                    </nav>

                    <div className="border-t border-(--border) px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-(--surface-2) text-sm font-bold ring-1 ring-(--border)">
                                <img src={user?.avatar ? user?.avatar : "/default.jpg"} alt="profile" className="rounded-full h-8 w-8" />
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold">{displayName}</div>
                                <div className="truncate text-xs font-medium text-(--text-muted)">
                                    {displayEmail}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="w-full justify-center"
                                onClick={onLogout}
                                disabled={isLoggingOut}
                            >
                                <LogOut size={16} />
                                {isLoggingOut ? "Logging out…" : "Logout"}
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile drawer */}
            <div
                className={cn(
                    "fixed inset-0 z-50 lg:hidden",
                    mobileOpen ? "pointer-events-auto" : "pointer-events-none"
                )}
                aria-hidden={!mobileOpen}
            >
                <div
                    className={cn(
                        "absolute inset-0 bg-black/40 transition-opacity",
                        mobileOpen ? "opacity-100" : "opacity-0"
                    )}
                    onClick={onMobileClose}
                />

                <aside
                    className={cn(
                        "absolute left-0 top-0 h-dvh w-72.5 bg-(--surface) shadow-2xl transition-transform",
                        mobileOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between px-5 py-5">
                            <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-(--primary) text-white shadow-sm">
                                    <LayoutDashboard size={18} />
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-extrabold tracking-tight">
                                        Shimanto Admin
                                    </div>
                                    <div className="truncate text-xs font-medium text-(--text-muted)">
                                        Dashboard
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={onMobileClose}
                                variant="ghost"
                                size="icon"
                                aria-label="Close sidebar"
                            >
                                <X size={18} />
                            </Button>
                        </div>

                        <nav className="flex-1 px-3">
                            <div className="space-y-1">
                                {navItems.map((item) => (
                                    <SidebarLink
                                        key={item.to}
                                        {...item}
                                        onNavigate={onMobileClose}
                                    />
                                ))}
                            </div>
                        </nav>

                        <div className="border-t border-(--border) px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="grid h-9 w-9 place-items-center rounded-full bg-(--surface-2) text-sm font-bold ring-1 ring-(--border)">
                                    <img src={user?.avatar ? user?.avatar : "/default.jpg"} alt="profile" className="rounded-full h-8 w-8" />
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold">{displayName}</div>
                                    <div className="truncate text-xs font-medium text-(--text-muted)">
                                        {displayEmail}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="w-full justify-center"
                                    onClick={onLogout}
                                    disabled={isLoggingOut}
                                >
                                    <LogOut size={16} />
                                    {isLoggingOut ? "Logging out…" : "Logout"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    )
}
