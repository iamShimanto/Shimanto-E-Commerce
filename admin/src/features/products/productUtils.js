export function formatMoneyBDT(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `৳ ${n.toLocaleString("en-US")}`;
}

export function safeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function calcTotalStock(variants) {
  if (!Array.isArray(variants)) return 0;
  return variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
}

export function computeFinalPrice(price, discountPercentage) {
  const p = Number(price);
  const d = Number(discountPercentage);
  if (!Number.isFinite(p)) return null;
  if (!Number.isFinite(d) || d <= 0) return p;
  return Math.max(0, Math.round((p * (100 - d)) / 100));
}
