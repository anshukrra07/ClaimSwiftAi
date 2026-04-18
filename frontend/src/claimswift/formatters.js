export function formatInr(value) {
  return `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(value || 0))}`;
}

export function formatPercent(value) {
  return `${Math.round(value || 0)}%`;
}

export function titleCase(value) {
  if (!value) return "";
  return String(value)
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function riskTone(band) {
  if (band === "high") return "rose";
  if (band === "medium") return "amber";
  return "teal";
}

export function statusTone(status) {
  if (status === "human_review" || status === "closed") return "rose";
  if (status === "verification_queue" || status === "clarification_required") return "amber";
  if (status === "approved_for_stp" || status === "settled") return "teal";
  return "blue";
}
