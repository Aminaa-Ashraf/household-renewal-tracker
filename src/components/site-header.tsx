import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

const navLinkClass =
  "text-sm font-medium text-white/75 transition-colors hover:text-white";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-accent-deep/40 bg-accent text-white shadow-[0_10px_30px_-18px_rgba(23,71,54,0.7)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
        <BrandMark tone="inverse" />
        <nav className="flex items-center gap-4 sm:gap-5">
          <Link href="/#home" className={navLinkClass}>
            Home
          </Link>
          <Link href="/#how-it-works" className={`hidden sm:inline ${navLinkClass}`}>
            How it works
          </Link>
          <Link href="/#privacy" className={`hidden sm:inline ${navLinkClass}`}>
            Privacy
          </Link>
        </nav>
      </div>
    </header>
  );
}
