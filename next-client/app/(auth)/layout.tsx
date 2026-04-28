"use client";

import type { ReactNode } from "react";

import PublicOnlyRouteGuard from "@/components/auth/PublicOnlyRouteGuard";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <PublicOnlyRouteGuard>{children}</PublicOnlyRouteGuard>;
}
