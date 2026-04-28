"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetProfileQuery } from "@/services/auth.service";
import DashboardPageHeader from "./dashboard/DashboardPageHeader";
import AdminDashboardView from "./dashboard/AdminDashboardView";
import StaffDashboardView from "./dashboard/StaffDashboardView";
import { useGetDashboardStatsQuery } from "@/services/stats.service";
import Skeleton from "@/components/ui/Skeleton";

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
  const isAllowed = isStaff || isAdmin;

  useEffect(() => {
    if (profileLoading) return;

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent("/admin")}`);
      return;
    }

    if (!isAllowed) {
      router.replace("/");
    }
  }, [isAllowed, profileLoading, router, user]);

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

  if (profileLoading || !user || !isAllowed) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-11 w-28 rounded-full" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>

        <Skeleton className="h-80 w-full" />
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
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 max-w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : null}
    </div>
  );
}
