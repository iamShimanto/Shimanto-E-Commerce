import type { AdminOrder } from "@/services/order.service";

export function getOrderCustomer(order?: AdminOrder | null) {
  const userName = order?.user?.fullName?.trim();
  const userEmail = order?.user?.email?.trim();
  const shipName = order?.shippingAddress?.fullName?.trim();
  const shipEmail = order?.shippingAddress?.email?.trim();

  return {
    name: userName || shipName || "Unnamed",
    email: userEmail || shipEmail || "—",
  };
}

export function getOrderStatusTone(status?: string | null) {
  const normalized = String(status ?? "").toLowerCase();

  if (normalized === "delivered" || normalized === "paid") return "success";
  if (normalized === "pending") return "warning";
  if (normalized === "failed" || normalized === "cancelled") return "danger";
  if (
    normalized === "processing" ||
    normalized === "confirmed" ||
    normalized === "shipped"
  ) {
    return "info";
  }

  return "neutral";
}

export function getOrderErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || !error) return fallback;

  if ("data" in error) {
    const payload = (error as { data?: { message?: string; error?: string } })
      .data;
    return payload?.message || payload?.error || fallback;
  }

  if ("error" in error) {
    return (error as { error?: string }).error || fallback;
  }

  return fallback;
}
