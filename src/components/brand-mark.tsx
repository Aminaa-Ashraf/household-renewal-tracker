import { cn } from "@/lib/utils";
import Link from "next/link";

export function BrandMark({
  className,
  href = "/",
  tone = "default",
}: {
  className?: string;
  href?: string | false;
  tone?: "default" | "inverse";
}) {
  const inverse = tone === "inverse";
  const mark = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-[14px]",
          inverse
            ? "bg-white/15 text-white ring-1 ring-white/25"
            : "bg-accent text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_6px_14px_-8px_rgba(31,94,74,0.55)]",
        )}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none">
          <path
            d="M7 4.5h6.2L17 8.2V19a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 19V6A1.5 1.5 0 0 1 7.5 4.5H7Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path d="M13 4.7V8h3.2" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M9 12.5h6M9 15.5h4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        className={cn(
          "font-display text-[0.98rem] font-semibold leading-none tracking-tight sm:text-[1.05rem]",
          inverse ? "text-white" : "text-ink",
        )}
      >
        Household Renewal Tracker
      </span>
    </span>
  );

  if (href === false) {
    return mark;
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        inverse ? "focus-visible:outline-white" : "focus-visible:outline-accent",
      )}
    >
      {mark}
    </Link>
  );
}
