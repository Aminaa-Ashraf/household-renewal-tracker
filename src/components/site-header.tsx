import { BrandMark } from "@/components/brand-mark";
import { ButtonLink } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b border-rule/80 bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <BrandMark />
        <div className="flex items-center gap-2">
          <ButtonLink href="/login" variant="ghost">
            Sign in
          </ButtonLink>
          <ButtonLink href="/signup" variant="secondary">
            Create account
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
