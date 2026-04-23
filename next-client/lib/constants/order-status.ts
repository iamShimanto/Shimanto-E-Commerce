export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;

export const ORDER_STATUS_OPTIONS = ORDER_STATUSES.map((status) => ({
  label: status,
  value: status,
}));

export const PAYMENT_STATUS_OPTIONS = PAYMENT_STATUSES.map((status) => ({
  label: status,
  value: status,
}));

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];
export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];