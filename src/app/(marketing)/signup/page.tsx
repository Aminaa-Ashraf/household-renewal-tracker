import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { getAuthFlags } from "@/lib/auth-flags";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  const { googleEnabled } = getAuthFlags();

  return (
    <AuthCard title="Create your account">
      <SignupForm googleEnabled={googleEnabled} />
    </AuthCard>
  );
}
