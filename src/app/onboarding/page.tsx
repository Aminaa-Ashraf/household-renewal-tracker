import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { CreateFamilyForm } from "@/components/family/create-family-form";
import { getActiveMembership } from "@/server/family";
import { requireSession } from "@/server/session";

export const metadata: Metadata = {
  title: "Create your household",
};

export default async function OnboardingPage() {
  const session = await requireSession();
  const membership = await getActiveMembership(session.user.id);

  if (membership) {
    redirect("/dashboard");
  }

  return (
    <AuthCard title="Name your household">
      <p className="mb-6 text-ink-muted">
        One family space for this account. You will be the owner and can invite
        others by email next. Signed in as {session.user.email}.
      </p>
      <CreateFamilyForm />
      <div className="mt-6 border-t border-rule pt-4">
        <SignOutButton />
      </div>
    </AuthCard>
  );
}
