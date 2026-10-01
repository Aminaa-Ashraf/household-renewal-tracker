import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ButtonLink } from "@/components/ui/button";

const navLinkClass =
  "hidden text-sm font-medium text-white/75 transition-colors hover:text-white sm:inline";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-accent-deep/40 bg-accent text-white shadow-[0_10px_30px_-18px_rgba(23,71,54,0.7)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
        <BrandMark tone="inverse" />
        <nav className="flex items-center gap-1 sm:gap-4">
          <Link href="/#home" className={navLinkClass}>
            Home
          </Link>
          <Link href="/#how-it-works" className={navLinkClass}>
            How it works
          </Link>
          <Link href="/#privacy" className={navLinkClass}>
            Privacy
          </Link>
          <ButtonLink
            href="/login"
            variant="ghost"
            className="min-h-10 px-3 text-sm text-white hover:bg-white/10 hover:text-white"
          >
            Sign in
          </ButtonLink>
          <ButtonLink
            href="/signup"
            variant="secondary"
            className="min-h-10 border-transparent bg-white px-4 text-sm text-accent shadow-none hover:bg-paper-raised"
          >
            Get started
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
