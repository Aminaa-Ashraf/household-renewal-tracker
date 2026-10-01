import { BrandMark } from "@/components/brand-mark";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatLongDate, formatRelativeExpiry } from "@/lib/dates";
import { getUrgency } from "@/lib/document-status";
import { PREVIEW_DOCUMENTS } from "@/lib/preview-data";

export default function HomePage() {
  const sample = PREVIEW_DOCUMENTS[0];

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <SiteHeader />

      <main>
        <section className="relative isolate overflow-hidden border-b border-rule/40">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(20,184,166,0.2),transparent_38%),radial-gradient(circle_at_88%_12%,rgba(37,99,235,0.14),transparent_36%)]"
          />

          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-12 md:py-16 lg:py-20">
            <div className="grid gap-6 animate-rise">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                Family paper vault
              </p>
              <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-ink md:text-5xl lg:text-6xl">
                Know what is expiring before it becomes a scramble.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-ink-muted">
                One shared vault for your household&apos;s CNIC, passport,
                vehicle, and insurance dates — with clear owners and calm next
                steps.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/signup" size="lg">
                  Create a free account
                </ButtonLink>
                <ButtonLink href="/login" variant="secondary" size="lg">
                  Sign in
                </ButtonLink>
              </div>
            </div>

            <div
              aria-label="Example paper"
              className="relative mx-auto w-full max-w-md animate-rise animate-rise-delay-1"
            >
              <article className="surface-3d-strong relative animate-float rounded-[1.5rem] border-l-4 border-l-accent p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
                      Example
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-semibold">
                      {sample.title}
                    </h2>
                  </div>
                  <StatusBadge urgency={getUrgency(sample.expiryDate)} />
                </div>
                <p className="mt-6 text-xl font-semibold tracking-tight">
                  {formatRelativeExpiry(sample.expiryDate)}
                </p>
                <p className="mt-1 text-ink-muted">
                  {formatLongDate(sample.expiryDate)}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-rule/70 pt-4 text-sm font-medium text-ink-muted">
                  <span>Papa · Passport</span>
                  <span>Open</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3 md:gap-8 md:py-20"
        >
          {[
            {
              n: "01",
              title: "Due soon",
              text: "Open the app and see the next 30 days, sorted by expiry.",
              delay: "animate-rise-delay-1",
            },
            {
              n: "02",
              title: "Whose paper",
              text: "Each document belongs to a family member. No guessing.",
              delay: "animate-rise-delay-2",
            },
            {
              n: "03",
              title: "What to do",
              text: "Renew it, mark it done, or leave it. Reminders come later.",
              delay: "animate-rise-delay-3",
            },
          ].map((item) => (
            <div
              key={item.n}
              className={`animate-rise ${item.delay} grid gap-3 border-t border-rule/80 pt-5`}
            >
              <p className="font-display text-sm font-semibold tracking-[0.16em] text-accent">
                {item.n}
              </p>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {item.title}
              </h2>
              <p className="text-ink-muted">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="surface-3d-strong rounded-[1.5rem] p-6 md:p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Add the first 3 papers
            </h2>
            <p className="mt-3 max-w-2xl text-ink-muted">
              Start with the ones that hurt when they expire: a CNIC, a
              passport, and one vehicle or insurance paper. Sign in first, then
              invite the household.
            </p>
            <div className="mt-6">
              <ButtonLink href="/signup">Get started</ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-rule/70 bg-paper-raised/60 px-4 py-6 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <BrandMark />
          <p className="text-sm font-medium text-ink-muted">
            Shared household vault
          </p>
        </div>
      </footer>
    </div>
  );
}
