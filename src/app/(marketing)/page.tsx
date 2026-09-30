import { BrandMark } from "@/components/brand-mark";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatLongDate, formatRelativeExpiry } from "@/lib/dates";
import { getUrgency } from "@/lib/document-status";
import { PREVIEW_DOCUMENTS } from "@/lib/preview-data";

export default function HomePage() {
  const sample = PREVIEW_DOCUMENTS[0];

  return (
    <div className="min-h-dvh">
      <SiteHeader />

      <main className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:py-16">
        <section className="grid gap-6 md:max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-terracotta">
            Family paper vault
          </p>
          <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight md:text-5xl">
            Know what is expiring, whose it is, and what to do next.
          </h1>
          <p className="text-lg leading-relaxed text-ink-muted">
            Built for one household — parents and adult children — not a
            personal reminder app. English first. Large buttons. Calm layout.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/dashboard" size="lg">
              Open the preview
            </ButtonLink>
            <ButtonLink href="#how-it-works" variant="secondary" size="lg">
              How it works
            </ButtonLink>
          </div>
        </section>

        <section
          aria-label="Example paper"
          className="rounded-2xl border border-rule bg-paper-raised p-5 md:max-w-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-ink-muted">Example</p>
              <h2 className="font-display text-2xl font-semibold">
                {sample.title}
              </h2>
            </div>
            <StatusBadge urgency={getUrgency(sample.expiryDate)} />
          </div>
          <p className="mt-4 text-lg font-medium">
            {formatRelativeExpiry(sample.expiryDate)}
          </p>
          <p className="text-ink-muted">{formatLongDate(sample.expiryDate)}</p>
        </section>

        <section id="how-it-works" className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-terracotta">1</p>
            <CardTitle className="mt-2">Due soon</CardTitle>
            <p className="mt-2 text-ink-muted">
              Open the app and see the next 30 days, sorted by expiry.
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-terracotta">2</p>
            <CardTitle className="mt-2">Whose paper</CardTitle>
            <p className="mt-2 text-ink-muted">
              Each document belongs to a family member. No guessing.
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-terracotta">3</p>
            <CardTitle className="mt-2">What to do</CardTitle>
            <p className="mt-2 text-ink-muted">
              Renew it, mark it done, or leave it. Reminders come later.
            </p>
          </Card>
        </section>

        <section>
          <Card className="border-dashed">
            <CardTitle>Add the first 3 papers</CardTitle>
            <p className="mt-2 max-w-xl text-ink-muted">
              Start with the ones that hurt when they expire: a CNIC, a
              passport, and one vehicle or insurance paper. Sign-in and real
              saving start in the next chapters.
            </p>
          </Card>
        </section>
      </main>

      <footer className="border-t border-rule px-4 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <BrandMark />
          <p className="text-sm text-ink-muted">Chapter 1 · shell only</p>
        </div>
      </footer>
    </div>
  );
}
