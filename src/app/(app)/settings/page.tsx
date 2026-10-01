import type { Metadata } from "next";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LeaveFamilyButton } from "@/components/family/leave-family-button";
import { Card, CardTitle } from "@/components/ui/card";
import { roleLabel } from "@/lib/roles";
import { requireFamilyMembership } from "@/server/family";
import { requireSession } from "@/server/session";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await requireSession();
  const membership = await requireFamilyMembership(session.user.id);

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-ink-muted">
          Account and household for this device.
        </p>
      </header>

      <Card>
        <p className="text-sm font-medium text-terracotta">Signed in</p>
        <CardTitle className="mt-2">
          {session.user.name ?? "Family member"}
        </CardTitle>
        <p className="mt-2 text-ink-muted">{session.user.email}</p>
        <p className="mt-2 text-sm text-ink-muted">
          {membership.family.name} · {roleLabel(membership.role)}
        </p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </Card>

      <Card>
        <CardTitle>Leave household</CardTitle>
        <p className="mt-2 text-sm text-ink-muted">
          You keep your login. Family papers you do not own stay behind.
        </p>
        <div className="mt-4">
          <LeaveFamilyButton />
        </div>
      </Card>
    </div>
  );
}
