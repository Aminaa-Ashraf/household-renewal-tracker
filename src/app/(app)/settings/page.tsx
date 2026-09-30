import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-ink-muted">
          Account, sign out, and leave-family live here later.
        </p>
      </header>
      <ComingSoon
        title="No account yet"
        chapter="Chapter 3"
        detail="Auth.js will add email/password, Google, and magic link. This page will then show who you are."
      />
    </div>
  );
}
