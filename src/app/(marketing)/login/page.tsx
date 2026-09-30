import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getAuthFlags } from "@/lib/auth-flags";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  const flags = getAuthFlags();

  return (
    <AuthCard title="Sign in">
      <Suspense fallback={<p className="text-ink-muted">Loading form…</p>}>
        <LoginForm
          googleEnabled={flags.googleEnabled}
          magicLinkEnabled={flags.magicLinkEnabled}
        />
      </Suspense>
    </AuthCard>
  );
}
