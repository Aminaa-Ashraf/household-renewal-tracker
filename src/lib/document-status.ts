import { daysUntil } from "@/lib/dates";

export type Urgency = "safe" | "due30" | "due7" | "expired";

export const urgencyLabel: Record<Urgency, string> = {
  safe: "Safe",
  due30: "Due in 30 days",
  due7: "Due in 7 days",
  expired: "Expired",
};

export function getUrgency(expiry: Date, now = new Date()): Urgency {
  const days = daysUntil(expiry, now);

  if (days < 0) return "expired";
  if (days <= 7) return "due7";
  if (days <= 30) return "due30";
  return "safe";
}
