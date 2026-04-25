import type { AdminProduct, ProductVariant } from "@/types/product.types";

export const PRODUCT_STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
] as const;

export const PRODUCT_PRICE_SORT_OPTIONS = [
  { label: "Newest", value: "default" },
  { label: "Price: Low to High", value: "asc" },
  { label: "Price: High to Low", value: "desc" },
] as const;

export const PRODUCT_SIZE_OPTIONS = [
  { label: "S", value: "s" },
  { label: "M", value: "m" },
  { label: "L", value: "l" },
  { label: "XL", value: "xl" },
  { label: "2XL", value: "2xl" },
  { label: "3XL", value: "3xl" },
] as const;

export function computeFinalPrice(price: unknown, discountPercentage: unknown) {
  const base = Number(price);
  const discount = Number(discountPercentage);

  if (!Number.isFinite(base) || base <= 0) return 0;
  if (!Number.isFinite(discount) || discount <= 0) return base;

  const ratio = Math.min(100, Math.max(0, discount)) / 100;
  return Math.max(0, Math.round((base - base * ratio) * 100) / 100);
}

export function calcTotalStock(variants: ProductVariant[] | undefined | null) {
  if (!Array.isArray(variants)) return 0;
  return variants.reduce(
    (sum, variant) => sum + (Number(variant?.stock) || 0),
    0,
  );
}

export function getCategoryId(product: AdminProduct | null | undefined) {
  const value = product?.category;
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id ?? value.id ?? "");
}

export function getCategoryLabel(product: AdminProduct | null | undefined) {
  const value = product?.category;
  if (!value) return "—";
  if (typeof value === "string") return value;
  return String(value.name ?? value.slug ?? value._id ?? "—");
}

export function getProductErrorMessage(error: unknown, fallback: string) {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      data?: unknown;
      error?: unknown;
      message?: unknown;
    };

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }

    const data = maybeError.data as
      | string
      | { message?: string; error?: string }
      | undefined;

    if (typeof data === "string" && data.trim()) return data;

    if (data && typeof data === "object") {
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }
      if (typeof data.error === "string" && data.error.trim()) {
        return data.error;
      }
    }

    if (typeof maybeError.error === "string" && maybeError.error.trim()) {
      return maybeError.error;
    }
  }

  return fallback;
}
