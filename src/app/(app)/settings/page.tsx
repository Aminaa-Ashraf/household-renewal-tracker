import type { Metadata } from "next";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Card, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-ink-muted">
          This is your account. Family settings come in the next chapters.
        </p>
      </header>

      <Card>
        <p className="text-sm font-medium text-terracotta">Signed in</p>
        <CardTitle className="mt-2">{session?.user?.name ?? "Family member"}</CardTitle>
        <p className="mt-2 text-ink-muted">{session?.user?.email}</p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </Card>
    </div>
  );
}
