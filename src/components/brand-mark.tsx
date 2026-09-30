import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        aria-hidden
        className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-paper-raised"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none">
          <path
            d="M7 4.5h6.2L17 8.2V19a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 19V6A1.5 1.5 0 0 1 7.5 4.5H7Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M13 4.7V8h3.2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M9 12.5h6M9 15.5h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold tracking-tight">
          Household
        </span>
        <span className="block text-sm text-ink-muted">Renewal Tracker</span>
      </span>
    </span>
  );
}
