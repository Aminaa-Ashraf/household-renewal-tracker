import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Card } from "@/components/ui/card";

export function AuthCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden px-4 py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-20 size-64 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 bottom-10 size-72 rounded-full bg-blue-500/15 blur-3xl"
      />

      <div className="relative z-10 mx-auto w-full max-w-md animate-rise">
        <BrandMark />
        <Card className="surface-3d-strong mt-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <div className="mt-6">{children}</div>
        </Card>
      </div>
    </div>
  );
}
