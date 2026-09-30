import { BrandMark } from "@/components/brand-mark";
import { ButtonLink } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b border-rule/80 bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <BrandMark />
        <ButtonLink href="/dashboard" variant="secondary">
          Preview dashboard
        </ButtonLink>
      </div>
    </header>
  );
}
