import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="min-h-dvh overflow-x-hidden">
      <SiteHeader />

      <main>
        <section id="home" className="relative isolate overflow-hidden scroll-mt-24">
          <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-10 md:py-16 lg:py-20">
            <div className="grid gap-6 animate-rise">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                Family paper vault
              </p>
              <h1 className="font-display text-4xl leading-[1.08] font-semibold tracking-tight text-ink md:text-5xl lg:text-[3.4rem]">
                Know what is expiring before it becomes a scramble.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-ink-muted">
                One shared place for Mother&apos;s CNIC, Father&apos;s passport,
                the car&apos;s token tax, and your insurance — so nobody finds
                out at the counter.
              </p>
              <div className="flex flex-col items-stretch gap-3 sm:items-start">
                <ButtonLink
                  href="/signup"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Start your family vault (free)
                </ButtonLink>
                <Link
                  href="/login"
                  className="text-center text-base font-medium text-ink-muted underline decoration-rule-strong underline-offset-4 transition-colors hover:text-ink sm:text-left"
                >
                  I already have an account
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md animate-rise animate-rise-delay-1">
              <div className="paper-card overflow-hidden p-2 shadow-[var(--shadow-lift)]">
                <div className="flex items-center justify-between px-3 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                      Due soon
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      Your household · next 30 days
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-soft px-2.5 py-1 text-xs font-semibold text-amber">
                    2 need attention
                  </span>
                </div>

                <ul className="grid gap-2 p-1">
                  <HeroRow
                    avatar={{ initial: "F", tone: "bg-[#dceee5] text-accent" }}
                    title="Father's passport"
                    meta="expires in 18 days · 19 Oct 2026"
                    badge={{ label: "Due soon", tone: "amber" }}
                  />
                  <HeroRow
                    avatar={{ initial: "M", tone: "bg-crimson-soft text-crimson" }}
                    title="Mother's CNIC"
                    meta="expired 4 days ago · 27 Sept 2026"
                    badge={{ label: "Expired", tone: "red" }}
                  />
                  <HeroRow
                    avatar={{ initial: "C", tone: "bg-amber-soft text-amber" }}
                    title="Car token tax"
                    meta="safe until Mar 2027"
                    badge={{ label: "All good", tone: "green" }}
                  />
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 md:py-20"
        >
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
              How it works
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Three calm steps. No scramble.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <StepCard
              title="See what's next"
              text="Open the app and see the next papers, sorted by date."
            >
              <div className="grid gap-2">
                {[
                  {
                    title: "Mother's CNIC",
                    when: "7 days",
                    tone: "text-crimson",
                  },
                  {
                    title: "Father's passport",
                    when: "18 days",
                    tone: "text-amber",
                  },
                  {
                    title: "Car token tax",
                    when: "Mar 2027",
                    tone: "text-accent",
                  },
                ].map((row) => (
                  <div
                    key={row.title}
                    className="flex items-center justify-between rounded-2xl bg-paper px-3 py-2.5 text-sm"
                  >
                    <span className="font-medium text-ink">{row.title}</span>
                    <span className={cn("font-semibold", row.tone)}>
                      {row.when}
                    </span>
                  </div>
                ))}
              </div>
            </StepCard>

            <StepCard
              title="Every paper has an owner"
              text="Each document belongs to someone at home. No guessing."
            >
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[
                  { name: "Mother", tone: "bg-crimson-soft text-crimson" },
                  { name: "Father", tone: "bg-[#dceee5] text-accent" },
                  { name: "Brother", tone: "bg-amber-soft text-amber" },
                  { name: "Sister", tone: "bg-[#e8e4f4] text-[#5b4d8a]" },
                ].map((person) => (
                  <span
                    key={person.name}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-rule/70 bg-paper-raised px-2.5 py-1.5 text-sm font-medium"
                  >
                    <span
                      className={cn(
                        "grid size-7 place-items-center rounded-full text-xs font-bold",
                        person.tone,
                      )}
                    >
                      {person.name[0]}
                    </span>
                    {person.name}
                  </span>
                ))}
              </div>
            </StepCard>

            <StepCard
              title="Decide in one tap"
              text="Renew it, leave a reminder, or mark it done."
            >
              <div className="flex flex-wrap gap-2">
                {["Renewed", "Remind me later", "Not needed"].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-rule bg-paper-raised px-3 py-2 text-sm font-semibold text-ink shadow-sm"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </StepCard>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14 md:pb-20">
          <div className="paper-card relative overflow-hidden px-6 py-10 md:px-12 md:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-amber-bright/15 blur-2xl"
            />
            <blockquote className="relative mx-auto max-w-3xl text-center">
              <p className="font-display text-2xl leading-snug font-semibold tracking-tight text-ink md:text-3xl md:leading-snug">
                “We only noticed Father&apos;s passport had expired two weeks
                before the trip.”
              </p>
              <p className="mt-5 text-base text-ink-muted md:text-lg">
                This app exists so that never happens to your family.
              </p>
            </blockquote>
          </div>
        </section>

        <section id="reminders" className="mx-auto max-w-6xl px-4 pb-14 md:pb-20">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_1.05fr] md:gap-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
                Reminders
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                A gentle nudge before the counter.
              </h2>
              <p className="mt-4 max-w-md text-ink-muted">
                We email you at 30, 7, and 1 day before expiry — and on the day
                itself — so Mother&apos;s CNIC doesn&apos;t sneak up on you.
              </p>
            </div>

            <div className="paper-card mx-auto w-full max-w-md p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink-muted">
                <span className="grid size-8 place-items-center rounded-full bg-olive-soft text-accent">
                  <MailIcon />
                </span>
                Email reminder
              </div>
              <div className="rounded-[20px] border border-rule/70 bg-paper px-4 py-3 text-[15px] leading-relaxed text-ink">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                  Household Renewal Tracker
                </p>
                <p className="mt-2">
                  Reminder: Mother&apos;s CNIC expires in 7 days. Open the
                  vault to renew it in time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="privacy"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-14 md:pb-20"
        >
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
              Trust & privacy
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Family papers stay in the family.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Your documents stay private",
                text: "Files are stored securely and only opened by people in your household.",
                icon: LockIcon,
              },
              {
                title: "Only family you invite",
                text: "Nobody sees a paper unless you invite them.",
                icon: PeopleIcon,
              },
              {
                title: "We never sell your data",
                text: "No ads. No data brokers. Your family dates stay yours.",
                icon: ShieldIcon,
              },
            ].map((item) => (
              <div key={item.title} className="paper-card grid gap-3 p-5">
                <span className="grid size-11 place-items-center rounded-2xl bg-olive-soft text-accent">
                  <item.icon />
                </span>
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-ink-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="paper-card grid gap-8 p-6 md:grid-cols-[1.1fr_0.9fr] md:items-center md:p-8">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                Add the first 3 papers
              </h2>
              <p className="mt-3 max-w-xl text-ink-muted">
                Start with the ones that hurt when they expire. Sign in, add
                them, then invite your family.
              </p>
              <div className="mt-6">
                <ButtonLink href="/signup">Add my first paper</ButtonLink>
              </div>
            </div>

            <ul className="grid gap-3">
              {[
                { label: "A CNIC", icon: IdIcon },
                { label: "A passport", icon: PassportIcon },
                { label: "A vehicle or insurance paper", icon: CarIcon },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-[18px] border border-rule/80 bg-paper px-4 py-3"
                >
                  <span
                    aria-hidden
                    className="grid size-6 place-items-center rounded-md border-2 border-rule-strong bg-paper-raised"
                  />
                  <span className="grid size-9 place-items-center rounded-xl bg-olive-soft text-accent">
                    <item.icon />
                  </span>
                  <span className="font-medium text-ink">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="faq"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-16"
        >
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Quick answers
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                q: "Is it only for one household?",
                a: "Yes. One family vault, shared with the people you invite.",
              },
              {
                q: "Do I need to upload files?",
                a: "No. Dates work on their own. Attach a scan only if you want it handy.",
              },
              {
                q: "How do reminders arrive?",
                a: "By email, ahead of expiry, so you have time to renew.",
              },
            ].map((item) => (
              <div key={item.q} className="border-t border-rule pt-4">
                <h3 className="font-semibold text-ink">{item.q}</h3>
                <p className="mt-2 text-sm text-ink-muted">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-accent-deep px-4 py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-lg font-semibold tracking-tight">
              Household Renewal Tracker
            </p>
            <p className="mt-2 text-sm text-white/70">
              Made for families in Pakistan.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
            <Link href="/#faq" className="text-white/70 hover:text-white">
              FAQ
            </Link>
            <Link href="/signup" className="text-white/70 hover:text-white">
              Create account
            </Link>
            <Link href="/login" className="text-white/70 hover:text-white">
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function HeroRow({
  avatar,
  title,
  meta,
  badge,
}: {
  avatar: { initial: string; tone: string };
  title: string;
  meta: string;
  badge: { label: string; tone: "amber" | "red" | "green" };
}) {
  const badgeTone = {
    amber: "bg-amber-soft text-amber",
    red: "bg-crimson-soft text-crimson",
    green: "bg-olive-soft text-accent",
  }[badge.tone];

  return (
    <li className="flex items-start justify-between gap-3 rounded-[18px] border border-rule/60 bg-paper px-3 py-3">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold",
            avatar.tone,
          )}
        >
          {avatar.initial}
        </span>
        <div>
          <p className="font-display font-semibold tracking-tight text-ink">
            {title}
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">{meta}</p>
        </div>
      </div>
      <span
        className={cn(
          "inline-flex shrink-0 rounded-xl px-2.5 py-1 text-xs font-semibold",
          badgeTone,
        )}
      >
        {badge.label}
      </span>
    </li>
  );
}

function StepCard({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <div className="paper-card flex flex-col gap-4 p-5">
      <div>
        <h3 className="font-display text-xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-sm text-ink-muted">{text}</p>
      </div>
      <div className="mt-auto">{children}</div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <rect
        x="3.5"
        y="6"
        width="17"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m4.5 8 7.5 5 7.5-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 10V8a4 4 0 0 1 8 0v2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16" cy="9" r="2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M4.5 17.5c.5-2.2 2.3-3.5 4.5-3.5s4 1.3 4.5 3.5M13 17.5c.3-1.5 1.5-2.5 3-2.5s2.7 1 3 2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <path
        d="M12 3.5 19 6.5v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-5l7-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IdIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="8.5" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M13 10.5h5M13 13.5h3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PassportIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <rect
        x="5"
        y="3.5"
        width="14"
        height="17"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8.5 16h7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <path
        d="M4 14.5h16l-1.2-4.2A2 2 0 0 0 16.9 9H7.1a2 2 0 0 0-1.9 1.3L4 14.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M5 14.5h14v3.5a1 1 0 0 1-1 1h-1.5a1.5 1.5 0 0 1-1.5-1.5H9A1.5 1.5 0 0 1 7.5 19H6a1 1 0 0 1-1-1v-3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
