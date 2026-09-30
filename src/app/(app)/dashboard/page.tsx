import type { Metadata } from "next";
import { DueSoonList } from "@/components/due-soon-list";
import { PREVIEW_DOCUMENTS } from "@/lib/preview-data";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Due soon
        </h1>
        <p className="text-ink-muted">
          What is expiring, whose it is, and how soon. These four papers are
          preview data so the screen is not empty.
        </p>
      </header>

      <DueSoonList documents={PREVIEW_DOCUMENTS} />
    </div>
  );
}
