"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { BrandMark } from "@/components/brand-mark";
import { roleLabel } from "@/lib/roles";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/documents/new", label: "Add", icon: AddIcon },
  { href: "/family", label: "Family", icon: FamilyIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppShell({
  children,
  userName,
  familyName,
  role,
  canAdd,
}: {
  children: ReactNode;
  userName?: string | null;
  familyName: string;
  role: Role;
  canAdd: boolean;
}) {
  const pathname = usePathname();
  const items = canAdd ? nav : nav.filter((item) => item.href !== "/documents/new");

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[270px_1fr]">
      <aside className="hidden border-r border-rule/70 bg-paper-raised/80 px-5 py-6 backdrop-blur-xl md:flex md:flex-col">
        <BrandMark />
        <div className="surface-3d mt-6 rounded-2xl p-3.5">
          <p className="text-sm font-semibold text-ink">
            {userName ?? "Signed in"}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {familyName} · {roleLabel(role)}
          </p>
        </div>
        <nav aria-label="App" className="mt-8 grid gap-2">
          {items.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={isActive(pathname, item.href)}
            />
          ))}
        </nav>
      </aside>

      <div className="flex min-h-dvh flex-col pb-24 md:pb-0">
        <header className="sticky top-0 z-10 border-b border-rule/70 bg-paper/80 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between gap-3">
            <BrandMark />
            <p className="text-right text-xs font-medium text-ink-muted">
              {familyName}
            </p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 animate-rise px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>

        <nav
          aria-label="App"
          className="fixed inset-x-0 bottom-0 z-10 border-t border-rule/70 bg-paper-raised/90 px-2 py-2 shadow-[0_-16px_36px_-24px_rgba(11,18,32,0.45)] backdrop-blur-xl md:hidden"
        >
          <ul
            className={cn(
              "grid gap-1",
              items.length === 4 ? "grid-cols-4" : "grid-cols-3",
            )}
          >
            {items.map((item) => (
              <li key={item.href}>
                <NavItem
                  {...item}
                  compact
                  active={isActive(pathname, item.href)}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/documents/new") {
    return pathname.startsWith("/documents");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  compact = false,
}: {
  href: string;
  label: string;
  icon: typeof HomeIcon;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-12 items-center rounded-2xl px-3 text-sm font-semibold transition-all duration-150",
        compact && "flex-col justify-center gap-1 px-1 text-xs",
        active
          ? "bg-gradient-to-b from-[#152338] to-ink text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_12px_20px_-14px_rgba(11,18,32,0.75),0_2px_0_#020617]"
          : "text-ink-muted hover:bg-ink/5 hover:text-ink",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M4.5 10.5 12 4.5l7.5 6V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-4.5v6H6A1.5 1.5 0 0 1 4.5 19v-8.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AddIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M12 6.5v11M6.5 12h11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FamilyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="8" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4.5 18c.4-2.4 2.3-4 4.5-4s4.1 1.6 4.5 4M10.5 18c.4-2.4 2.3-4 4.5-4s4.1 1.6 4.5 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 5v2M12 17v2M5 12h2M17 12h2M7.2 7.2l1.4 1.4M15.4 15.4l1.4 1.4M16.8 7.2l-1.4 1.4M8.6 15.4l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
