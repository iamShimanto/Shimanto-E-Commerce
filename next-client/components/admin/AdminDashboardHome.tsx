"use client";

import { useRouter } from "next/navigation";
import { useGetProfileQuery } from "@/services/auth.service";
import DashboardPageHeader from "./dashboard/DashboardPageHeader";
import AdminDashboardView from "./dashboard/AdminDashboardView";
import StaffDashboardView from "./dashboard/StaffDashboardView";
import { useGetDashboardStatsQuery } from "@/services/stats.service";

export default function AdminDashboardHome() {
  const router = useRouter();
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();
  const {
    data: statsData,
    isLoading: statsLoading,
    isFetching: statsFetching,
    isError,
    error,
    refetch,
  } = useGetDashboardStatsQuery();

  const user = profileData?.data ?? null;
  const role = String(user?.role || "").toLowerCase();
  const isStaff = role === "staff";
  const isAdmin = role === "admin";

  const errorText =
    typeof error === "object" && error && "data" in error
      ? ((error as { data?: { message?: string; error?: string } }).data
          ?.message ??
        (error as { data?: { message?: string; error?: string } }).data
          ?.error ??
        "Failed to load dashboard stats")
      : typeof error === "object" && error && "error" in error
        ? ((error as { error?: string }).error ??
          "Failed to load dashboard stats")
        : "Failed to load dashboard stats";

  if (profileLoading || (!isStaff && !isAdmin && !user)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <div className="text-sm font-semibold text-slate-500 dark:text-white/60">
          Loading…
        </div>
      </div>
    );
  }

  if (isStaff) {
    return <StaffDashboardView />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        generatedAt={statsData?.data?.generatedAt}
        isRefreshing={statsFetching || statsLoading}
        onRefresh={() => refetch()}
        onViewOrders={() => router.push("/admin/orders")}
      />

      {isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
          {errorText}
        </div>
      ) : null}

      {statsData?.data ? <AdminDashboardView data={statsData.data} /> : null}

      {!statsData?.data && !isError ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-center text-sm font-semibold text-slate-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white/60">
          Loading dashboard data…
        </div>
      ) : null}
    </div>
  );
}
