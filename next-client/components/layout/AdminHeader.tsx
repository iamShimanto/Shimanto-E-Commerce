"use client";

import { Bell, Menu, Search } from "lucide-react";
import Link from "next/link";

import ThemeToggle from "@/components/ui/ThemeToggle";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { useGetProfileQuery } from "@/services/auth.service";

type AdminHeaderProps = {
  onOpenSidebar: () => void;
};

export default function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const { data: profileData } = useGetProfileQuery();
  const user = profileData?.data ?? null;
  const isstaff = String(user?.role || "").toLowerCase() === "staff";
  const displayName = user?.fullName || (isstaff ? "staff" : "Admin");
  const initial = (displayName.trim().charAt(0) || "A").toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/85 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/85">
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
            <div className="text-sm font-extrabold tracking-tight text-slate-950 dark:text-white">
              {isstaff ? "staff Dashboard" : "Admin Dashboard"}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-white/60">
              {isstaff
                ? "Manage assigned operations with limited access"
                : "Manage products, orders and customers"}
            </div>
          </div>

          <div className="ml-auto flex w-full max-w-130 items-center gap-2 rounded-2xl border border-zinc-200 bg-slate-50 px-3 py-2 shadow-sm dark:border-zinc-800 dark:bg-white/5 sm:ml-6">
            <Search size={16} className="text-slate-500 dark:text-white/50" />
            <input
              className={cn(
                "w-full bg-transparent text-sm font-semibold text-slate-950 dark:text-white",
                "placeholder:text-slate-500 focus:outline-none dark:placeholder:text-white/50",
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
            className="relative h-10 w-10 text-slate-500 hover:text-slate-950 dark:text-white/70 dark:hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sky-500" />
          </Button>

          <ThemeToggle />

          <div className="hidden items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:flex">
            <div
              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-extrabold ring-1 ring-zinc-200 dark:bg-white/10 dark:ring-zinc-800"
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
            <Link href="/admin/profile" className="leading-tight">
              <div className="text-xs font-extrabold text-slate-950 dark:text-white">
                {displayName}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-white/60">
                Online
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}