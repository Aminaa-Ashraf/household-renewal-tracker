import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Family",
};

export default function FamilyPage() {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Family
        </h1>
        <p className="mt-2 text-ink-muted">
          Invite parents and adult children by email. One household per user.
        </p>
      </header>
      <ComingSoon
        title="Create and invite come next"
        chapter="Chapters 4 and 7"
        detail="First you will create a family after sign-in. Later you will send an invite and accept it."
      />
    </div>
  );
}
