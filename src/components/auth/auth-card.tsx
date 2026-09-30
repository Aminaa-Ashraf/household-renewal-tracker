import type { ReactNode } from "react";
import Link from "next/link";
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
    <div className="flex min-h-dvh flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="inline-flex">
          <BrandMark />
        </Link>
        <Card className="mt-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <div className="mt-6">{children}</div>
        </Card>
      </div>
    </div>
  );
}
