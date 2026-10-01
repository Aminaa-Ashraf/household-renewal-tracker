import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentActions } from "@/components/documents/document-actions";
import { DocumentForm } from "@/components/documents/document-form";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { formatLongDate, formatRelativeExpiry } from "@/lib/dates";
import { getUrgency } from "@/lib/document-status";
import {
  canEditDocument,
  canUploadDocuments,
  documentTypeLabel,
  roleLabel,
} from "@/lib/roles";
import {
  getDocumentForUser,
  listActiveFamilyMembers,
} from "@/server/documents";
import { requireSession } from "@/server/session";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Paper details" };
}

export default async function DocumentDetailPage({ params }: Params) {
  const session = await requireSession();
  const { id } = await params;

  let document;
  let membership;
  try {
    ({ document, membership } = await getDocumentForUser(session.user.id, id));
  } catch {
    notFound();
  }

  const canEdit = canEditDocument(membership.role, session.user.id, document);
  const members = await listActiveFamilyMembers(membership.familyId);
  const expiry = document.expiryDate;

  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <p className="text-sm text-ink-muted">
          <Link href="/dashboard" className="underline">
            Due soon
          </Link>{" "}
          / paper
        </p>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {document.title}
          </h1>
          <StatusBadge urgency={getUrgency(expiry)} />
        </div>
        <p className="text-ink-muted">
          {document.person.name ?? document.person.email} ·{" "}
          {documentTypeLabel(document.type)}
        </p>
        <p className="text-lg font-medium">{formatRelativeExpiry(expiry)}</p>
        <p className="text-sm text-ink-muted">{formatLongDate(expiry)}</p>
      </header>

      <Card>
        <CardTitle>What to do</CardTitle>
        <p className="mt-2 text-ink-muted">
          Renew it, mark it done, or leave it for later. Your role here:{" "}
          {roleLabel(membership.role)}.
        </p>
        <div className="mt-4">
          <DocumentActions documentId={document.id} canEdit={canEdit} />
        </div>
      </Card>

      {document.file ? (
        <Card>
          <CardTitle>Attached file</CardTitle>
          <p className="mt-2 text-sm text-ink-muted">{document.file.fileName}</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-rule bg-paper">
            {document.file.mimeType.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/files/${document.file.id}`}
                alt={document.file.fileName}
                className="max-h-[28rem] w-full object-contain"
              />
            ) : (
              <iframe
                title={document.file.fileName}
                src={`/api/files/${document.file.id}`}
                className="h-[28rem] w-full"
              />
            )}
          </div>
        </Card>
      ) : null}

      {document.reminders.length > 0 ? (
        <Card>
          <CardTitle>Reminder log</CardTitle>
          <ul className="mt-3 grid gap-2 text-sm text-ink-muted">
            {document.reminders.map((log) => (
              <li key={log.id}>
                {log.window.replace("_", " ").toLowerCase()} · sent{" "}
                {formatLongDate(log.sentAt)}
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <CardTitle>Reminder log</CardTitle>
          <p className="mt-2 text-ink-muted">
            No reminder emails sent yet for this paper.
          </p>
        </Card>
      )}

      <Card>
        <CardTitle>Audit</CardTitle>
        <ul className="mt-3 grid gap-1 text-sm text-ink-muted">
          <li>
            Added by {document.createdBy.name ?? document.createdBy.email} on{" "}
            {formatLongDate(document.createdAt)}
          </li>
          {document.updatedBy ? (
            <li>
              Last edit by {document.updatedBy.name ?? document.updatedBy.email}{" "}
              on {formatLongDate(document.updatedAt)}
            </li>
          ) : null}
          {document.renewedBy ? (
            <li>
              Marked renewed by{" "}
              {document.renewedBy.name ?? document.renewedBy.email}
            </li>
          ) : null}
        </ul>
      </Card>

      {canEdit && canUploadDocuments(membership.role) ? (
        <section className="grid gap-4">
          <h2 className="font-display text-2xl font-semibold">Edit paper</h2>
          <DocumentForm
            documentId={document.id}
            members={members.map((member) => ({
              id: member.user.id,
              name: member.user.name ?? member.user.email ?? "Family member",
            }))}
            initial={{
              title: document.title,
              type: document.type,
              personId: document.personId,
              issueDate: document.issueDate
                ? document.issueDate.toISOString().slice(0, 10)
                : "",
              expiryDate: document.expiryDate.toISOString().slice(0, 10),
              notes: document.notes ?? "",
              remind30: document.remind30,
              remind7: document.remind7,
              remind1: document.remind1,
              status: document.status,
            }}
          />
        </section>
      ) : null}
    </div>
  );
}
