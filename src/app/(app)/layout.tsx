import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { canUploadDocuments } from "@/lib/roles";
import { getActiveMembership } from "@/server/family";
import { requireSession } from "@/server/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  const membership = await getActiveMembership(session.user.id);

  if (!membership) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      userName={session.user.name ?? session.user.email}
      familyName={membership.family.name}
      role={membership.role}
      canAdd={canUploadDocuments(membership.role)}
    >
      {children}
    </AppShell>
  );
}
