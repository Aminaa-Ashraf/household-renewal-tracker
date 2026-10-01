import { urgencyLabel, type Urgency } from "@/lib/document-status";
import { cn } from "@/lib/utils";

const styles: Record<Urgency, string> = {
  safe: "bg-olive-soft text-accent shadow-[0_1px_0_rgba(255,255,255,0.55)_inset]",
  due30:
    "bg-amber-soft text-amber shadow-[0_1px_0_rgba(255,255,255,0.55)_inset]",
  due7: "bg-amber-soft text-amber shadow-[0_1px_0_rgba(255,255,255,0.55)_inset]",
  expired:
    "bg-crimson-soft text-crimson shadow-[0_1px_0_rgba(255,255,255,0.55)_inset]",
};

export function StatusBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-xl border border-black/5 px-3 text-sm font-semibold tracking-tight",
        styles[urgency],
      )}
    >
      {urgencyLabel[urgency]}
    </span>
  );
}
