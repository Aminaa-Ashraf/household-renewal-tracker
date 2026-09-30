const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDays(from: Date, days: number): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next;
}

export function daysUntil(expiry: Date, now = new Date()): number {
  return Math.round(
    (startOfDay(expiry).getTime() - startOfDay(now).getTime()) / MS_PER_DAY,
  );
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatRelativeExpiry(expiry: Date, now = new Date()): string {
  const days = daysUntil(expiry, now);

  if (days === 0) return "expires today";
  if (days === 1) return "expires in 1 day";
  if (days > 1) return `expires in ${days} days`;
  if (days === -1) return "expired 1 day ago";
  return `expired ${Math.abs(days)} days ago`;
}
