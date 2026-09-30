import { urgencyLabel, type Urgency } from "@/lib/document-status";
import { cn } from "@/lib/utils";

const styles: Record<Urgency, string> = {
  safe: "bg-olive-soft text-olive",
  due30: "bg-amber-soft text-amber",
  due7: "bg-[#f8dfcf] text-terracotta-deep",
  expired: "bg-crimson-soft text-crimson",
};

export function StatusBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full px-3 text-sm font-medium",
        styles[urgency],
      )}
    >
      {urgencyLabel[urgency]}
    </span>
  );
}
