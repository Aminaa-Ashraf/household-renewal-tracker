import { urgencyLabel, type Urgency } from "@/lib/document-status";
import { cn } from "@/lib/utils";

const styles: Record<Urgency, string> = {
  safe: "bg-olive-soft text-olive shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_4px_10px_-6px_rgba(21,128,61,0.35)]",
  due30:
    "bg-amber-soft text-amber shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_4px_10px_-6px_rgba(180,83,9,0.3)]",
  due7: "bg-teal-50 text-accent-deep shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_4px_10px_-6px_rgba(15,118,110,0.35)]",
  expired:
    "bg-crimson-soft text-crimson shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_4px_10px_-6px_rgba(185,28,28,0.3)]",
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
