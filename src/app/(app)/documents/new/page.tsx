import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DocumentForm } from "@/components/documents/document-form";
import { canUploadDocuments } from "@/lib/roles";
import { listFamilyProfilesForDocs } from "@/server/documents";
import { requireFamilyMembership } from "@/server/family";
import { requireSession } from "@/server/session";

export const metadata: Metadata = {
  title: "Add document",
};

export default async function NewDocumentPage() {
  const session = await requireSession();
  const membership = await requireFamilyMembership(session.user.id);

  if (!canUploadDocuments(membership.role)) {
    redirect("/dashboard");
  }

  const profiles = await listFamilyProfilesForDocs(membership.familyId);
  const defaultProfile =
    profiles.find((profile) => profile.name)?.id ?? profiles[0]?.id ?? "";

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Add a paper
        </h1>
        <p className="mt-2 text-ink-muted">
          Title, type, whose it is, and the expiry date. Photo is optional.
        </p>
      </header>

      <DocumentForm
        members={profiles.map((profile) => ({
          id: profile.id,
          name: profile.name,
        }))}
        initial={{ personId: defaultProfile }}
      />
    </div>
  );
}
