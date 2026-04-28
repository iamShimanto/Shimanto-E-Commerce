"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useGetProfileQuery } from "@/services/auth.service";
import Skeleton from "@/components/ui/Skeleton";

function buildCurrentPath(
  pathname: string,
  searchParams: { toString(): string },
) {
  const search = searchParams.toString();
  return search ? `${pathname}?${search}` : pathname;
}

type AdminRouteGuardProps = {
  children: ReactNode;
};

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: profileData, isLoading, isFetching } = useGetProfileQuery();
  const user = profileData?.data ?? null;
  const role = String(user?.role ?? "").toLowerCase();
  const isAllowed = role === "admin" || role === "staff";

  useEffect(() => {
    if (isLoading || isFetching) return;

    const currentPath = buildCurrentPath(pathname, searchParams);

    if (!user) {
      const next = encodeURIComponent(currentPath);
      router.replace(`/login?next=${next}`);
      return;
    }

    if (!isAllowed) {
      router.replace("/");
    }
  }, [isAllowed, isFetching, isLoading, pathname, router, searchParams, user]);

  if (isLoading || isFetching) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-72 max-w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!user || !isAllowed) {
    return null;
  }

  return <>{children}</>;
}
