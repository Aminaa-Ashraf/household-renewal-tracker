import { BrandMark } from "@/components/brand-mark";
import { ButtonLink } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-paper-raised/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
        <BrandMark />
        <div className="flex items-center gap-1 sm:gap-2">
          <ButtonLink href="/login" variant="ghost" className="min-h-10 px-3 text-sm">
            Sign in
          </ButtonLink>
          <ButtonLink href="/signup" variant="secondary" className="min-h-10 px-4 text-sm">
            Create account
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
