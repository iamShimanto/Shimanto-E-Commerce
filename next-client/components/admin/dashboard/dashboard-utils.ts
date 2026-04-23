export function formatCount(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "0";
  return numberValue.toLocaleString("en-US");
}

export function formatMoneyBDT(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "৳ 0";
  return `৳ ${numberValue.toLocaleString("en-US")}`;
}

export function formatDateTime(value: string | Date | number | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function toList<T>(value: T[] | undefined | null) {
  return Array.isArray(value) ? value : [];
}