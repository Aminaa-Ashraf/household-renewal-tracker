import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  href = "/",
}: {
  className?: string;
  href?: string | false;
}) {
  const mark = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink text-white shadow-sm"
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
      <span className="font-display text-[0.98rem] font-semibold leading-none tracking-tight text-ink sm:text-[1.05rem]">
        Household Renewal Tracker
      </span>
    </span>
  );

  if (href === false) {
    return mark;
  }

  return (
    <Link href={href} className="inline-flex rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
      {mark}
    </Link>
  );
}
