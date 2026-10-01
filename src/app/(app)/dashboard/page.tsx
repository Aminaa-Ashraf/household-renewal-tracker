import type { Metadata } from "next";
import { DueSoonList } from "@/components/due-soon-list";
import { ButtonLink } from "@/components/ui/button";
import { canUploadDocuments } from "@/lib/roles";
import { listFamilyDocuments } from "@/server/documents";
import { requireFamilyMembership } from "@/server/family";
import { requireSession } from "@/server/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await requireSession();
  const membership = await requireFamilyMembership(session.user.id);
  const documents = await listFamilyDocuments(session.user.id);
  const canAdd = canUploadDocuments(membership.role);

  return (
    <div className="grid gap-6">
      <header className="surface-3d flex flex-wrap items-start justify-between gap-4 rounded-[1.35rem] p-5">
        <div className="grid gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
            {membership.family.name}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Due soon
          </h1>
          <p className="text-ink-muted">
            What is expiring, whose it is, and how soon.
          </p>
        </div>
        {canAdd ? (
          <ButtonLink href="/documents/new" variant="secondary">
            Add paper
          </ButtonLink>
        ) : null}
      </header>

      <DueSoonList
        canAdd={canAdd}
        documents={documents.map((doc) => ({
          id: doc.id,
          title: doc.title,
          type: doc.type,
          person: doc.person.name ?? doc.person.email ?? "Family member",
          personId: doc.personId,
          expiryDate: doc.expiryDate.toISOString(),
        }))}
      />
    </div>
  );
}
