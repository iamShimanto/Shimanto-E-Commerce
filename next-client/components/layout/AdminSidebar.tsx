"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  ShoppingCart,
  User,
  Users,
  X,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import {
  authApi,
  useGetProfileQuery,
  useLogoutMutation,
} from "@/services/auth.service";

const adminNavItems = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", Icon: ClipboardList },
  { to: "/admin/products", label: "Products", Icon: Boxes },
  { to: "/admin/categories", label: "Categories", Icon: BarChart3 },
  { to: "/admin/users", label: "Customers", Icon: Users },
  { to: "/admin/subscription", label: "Subscription", Icon: Mail },
  { to: "/admin/cart", label: "Cart", Icon: ShoppingCart },
  { to: "/admin/profile", label: "Profile", Icon: User },
  { to: "/admin/settings", label: "Settings", Icon: Settings },
];

const staffNavItems = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", Icon: ClipboardList },
  { to: "/admin/products", label: "Products", Icon: Boxes },
  { to: "/admin/categories", label: "Categories", Icon: BarChart3 },
  { to: "/admin/users", label: "Customers", Icon: Users },
  { to: "/admin/subscription", label: "Subscription", Icon: Mail },
  { to: "/admin/profile", label: "Profile", Icon: User },
];

function SidebarLink({
  to,
  label,
  Icon: NavIcon,
  end,
  onNavigate,
}: {
  to: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  end?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = end
    ? pathname === to
    : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Link
      href={to}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
        "text-(--text-muted) hover:bg-(--surface-2) hover:text-(--text)",
        isActive && "bg-(--surface-2) text-(--text) ring-1 ring-(--border)",
      )}
    >
      <NavIcon
        size={18}
        className="opacity-85 transition group-hover:opacity-100"
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

type AdminSidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export default function AdminSidebar({
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const toast = useToast();
  const mobileDrawerRef = useRef<HTMLElement | null>(null);

  const { data: profileData } = useGetProfileQuery();
  const [triggerLogout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const user = profileData?.data ?? null;
  const role = String(user?.role || "").toLowerCase();
  const isstaff = role === "staff";
  const navItems = isstaff ? staffNavItems : adminNavItems;

  const displayName = user?.fullName || (isstaff ? "staff" : "Admin");
  const displayEmail = user?.email || "contact@shimanto.dev";
  const initial = (displayName.trim().charAt(0) || "A").toUpperCase();

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onMobileClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onMobileClose]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const onLogout = async () => {
    try {
      await triggerLogout().unwrap();
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : typeof error === "object" && error !== null && "data" in error
            ? ((error as { data?: { message?: string; error?: string } }).data
                ?.message ??
              (error as { data?: { message?: string; error?: string } }).data
                ?.error ??
              "Logout failed")
            : "Logout failed";

      toast.error("Logout failed", message);
    } finally {
      dispatch(authApi.util.resetApiState());
      router.push("/login");
      toast.success("Logged out");
      onMobileClose();
    }
  };

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-(--border) bg-(--surface) text-(--text) lg:block">
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-(--primary) text-white shadow-sm">
              <LayoutDashboard size={18} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-extrabold tracking-tight">
                {isstaff ? "staff" : "Admin"}
              </div>
              <div className="truncate text-xs font-medium text-(--text-muted)">
                Dashboard
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-3">
            <div className="space-y-1">
              {navItems.map((item) => (
                <SidebarLink key={item.to} {...item} />
              ))}
            </div>
          </nav>

          <div className="border-t border-(--border) px-5 py-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-(--surface-2) text-sm font-bold ring-1 ring-(--border)"
                style={
                  user?.avatar
                    ? {
                        backgroundImage: `url(${user.avatar})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                {!user?.avatar && <span>{initial}</span>}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {displayName}
                </div>
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
                startIcon={<LogOut size={16} />}
              >
                {isLoggingOut ? "Logging out…" : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={onMobileClose}
        />

        <aside
          ref={mobileDrawerRef}
          className={cn(
            "absolute left-0 top-0 h-dvh w-72 bg-(--surface) shadow-2xl transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-full flex-col overflow-hidden text-(--text)">
            <div className="flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-(--primary) text-white shadow-sm">
                  <LayoutDashboard size={18} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold tracking-tight">
                    {isstaff ? "Shimanto staff" : "Shimanto Admin"}
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

            <nav className="flex-1 overflow-y-auto px-3 pb-3">
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
                <div
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-(--surface-2) text-sm font-bold ring-1 ring-(--border)"
                  style={
                    user?.avatar
                      ? {
                          backgroundImage: `url(${user.avatar})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  {!user?.avatar && <span>{initial}</span>}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {displayName}
                  </div>
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
                  startIcon={<LogOut size={16} />}
                >
                  {isLoggingOut ? "Logging out…" : "Logout"}
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
