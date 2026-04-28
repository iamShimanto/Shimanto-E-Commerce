"use client";

import { useState, type ReactNode } from "react";

import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminRouteGuard from "@/components/auth/AdminRouteGuard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminRouteGuard>
      <div className="flex min-h-screen bg-(--bg) text-(--text)">
        <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader onOpenSidebar={() => setMobileOpen(true)} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
