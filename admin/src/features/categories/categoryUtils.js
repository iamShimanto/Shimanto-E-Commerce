export function safeText(value) {
  return typeof value === "string" ? value : value ? String(value) : "";
}
