"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useGetProfileQuery } from "@/services/auth.service";
import Skeleton from "@/components/ui/Skeleton";

function isSafeAppPath(path: string) {
  const trimmed = path.trim();
  return trimmed.startsWith("/") && !trimmed.startsWith("//");
}

function isAuthPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/verify-otp" ||
    pathname === "/resend-otp"
  );
}

type PublicOnlyRouteGuardProps = {
  children: ReactNode;
};

export default function PublicOnlyRouteGuard({
  children,
}: PublicOnlyRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: profileData, isLoading, isFetching } = useGetProfileQuery();

  const user = profileData?.data ?? null;
  const role = String(user?.role ?? "").toLowerCase();
  const isAdminOrStaff = role === "admin" || role === "staff";

  useEffect(() => {
    if (isLoading || isFetching) return;
    if (!user) return;
    if (!isAuthPath(pathname)) return;

    const nextParam = searchParams.get("next");
    const nextUrl =
      typeof nextParam === "string" && isSafeAppPath(nextParam)
        ? nextParam.trim()
        : null;

    const fallback = isAdminOrStaff ? "/admin" : "/";

    if (nextUrl) {
      const tryingAdmin = nextUrl === "/admin" || nextUrl.startsWith("/admin/");
      if (tryingAdmin && !isAdminOrStaff) {
        router.replace(fallback);
        return;
      }

      if (isAuthPath(nextUrl)) {
        router.replace(fallback);
        return;
      }

      router.replace(nextUrl);
      return;
    }

    router.replace(fallback);
  }, [
    isAdminOrStaff,
    isFetching,
    isLoading,
    pathname,
    router,
    searchParams,
    user,
  ]);

  if ((isLoading || isFetching) && isAuthPath(pathname)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-72 max-w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (user && isAuthPath(pathname)) {
    return null;
  }

  return <>{children}</>;
}
