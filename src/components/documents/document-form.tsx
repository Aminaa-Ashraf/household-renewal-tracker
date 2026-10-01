"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DOCUMENT_TYPE_OPTIONS } from "@/lib/roles";

type MemberOption = {
  id: string;
  name: string;
};

type DocumentFormValues = {
  title: string;
  type: string;
  personId: string;
  issueDate: string;
  expiryDate: string;
  notes: string;
  remind30: boolean;
  remind7: boolean;
  remind1: boolean;
  status: string;
};

export function DocumentForm({
  members,
  initial,
  documentId,
}: {
  members: MemberOption[];
  initial?: Partial<DocumentFormValues>;
  documentId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [remind30, setRemind30] = useState(initial?.remind30 ?? true);
  const [remind7, setRemind7] = useState(initial?.remind7 ?? true);
  const [remind1, setRemind1] = useState(initial?.remind1 ?? true);

  async function onSubmit(formData: FormData) {
    setError(undefined);
    setPending(true);

    const payload = {
      title: String(formData.get("title") ?? ""),
      type: String(formData.get("type") ?? ""),
      personId: String(formData.get("personId") ?? ""),
      issueDate: String(formData.get("issueDate") ?? "") || null,
      expiryDate: String(formData.get("expiryDate") ?? ""),
      notes: String(formData.get("notes") ?? "") || null,
      remind30,
      remind7,
      remind1,
      status: String(formData.get("status") ?? "ACTIVE"),
    };

    const response = await fetch(
      documentId ? `/api/documents/${documentId}` : "/api/documents",
      {
        method: documentId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = (await response.json().catch(() => null)) as
      | { error?: string; document?: { id: string } }
      | null;

    if (!response.ok || !data?.document) {
      setPending(false);
      setError(data?.error ?? "Could not save the paper.");
      return;
    }

    const file = formData.get("file");
    if (file instanceof File && file.size > 0) {
      const upload = new FormData();
      upload.set("file", file);
      const uploadResponse = await fetch(
        `/api/documents/${data.document.id}/file`,
        { method: "POST", body: upload },
      );
      if (!uploadResponse.ok) {
        const uploadData = (await uploadResponse.json().catch(() => null)) as
          | { error?: string }
          | null;
        setPending(false);
        setError(
          uploadData?.error ??
            "Paper saved, but the file upload failed. Open the paper and try again.",
        );
        router.push(`/documents/${data.document.id}`);
        router.refresh();
        return;
      }
    }

    router.push(`/documents/${data.document.id}`);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      <FormError message={error} />

      <Input
        label="Title"
        name="title"
        placeholder="Father's passport"
        defaultValue={initial?.title}
        required
        minLength={2}
      />

      <div className="grid gap-2">
        <label htmlFor="type" className="text-sm font-medium">
          Document type
        </label>
        <select
          id="type"
          name="type"
          defaultValue={initial?.type ?? "PASSPORT"}
          className="min-h-12 rounded-xl border border-rule bg-paper-raised px-3 text-base"
          required
        >
          {DOCUMENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="personId" className="text-sm font-medium">
          Whose paper
        </label>
        <select
          id="personId"
          name="personId"
          defaultValue={initial?.personId ?? members[0]?.id}
          className="min-h-12 rounded-xl border border-rule bg-paper-raised px-3 text-base"
          required
        >
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Issue date"
          name="issueDate"
          type="date"
          defaultValue={initial?.issueDate}
        />
        <Input
          label="Expiry date"
          name="expiryDate"
          type="date"
          defaultValue={initial?.expiryDate}
          required
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initial?.notes}
          className="rounded-xl border border-rule bg-paper-raised px-4 py-3 text-base"
          placeholder="Where the paper is kept, renewal tips…"
        />
      </div>

      <fieldset className="grid gap-3 rounded-2xl border border-rule p-4">
        <legend className="px-1 text-sm font-medium">Reminder emails</legend>
        <label className="flex min-h-11 items-center gap-3 text-base">
          <input
            type="checkbox"
            checked={remind30}
            onChange={(event) => setRemind30(event.target.checked)}
            className="size-5"
          />
          30 days before
        </label>
        <label className="flex min-h-11 items-center gap-3 text-base">
          <input
            type="checkbox"
            checked={remind7}
            onChange={(event) => setRemind7(event.target.checked)}
            className="size-5"
          />
          7 days before
        </label>
        <label className="flex min-h-11 items-center gap-3 text-base">
          <input
            type="checkbox"
            checked={remind1}
            onChange={(event) => setRemind1(event.target.checked)}
            className="size-5"
          />
          1 day before
        </label>
      </fieldset>

      {documentId ? (
        <div className="grid gap-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "ACTIVE"}
            className="min-h-12 rounded-xl border border-rule bg-paper-raised px-3 text-base"
          >
            <option value="ACTIVE">Active</option>
            <option value="RENEWED">Renewed</option>
            <option value="EXPIRED">Expired</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      ) : (
        <input type="hidden" name="status" value="ACTIVE" />
      )}

      <Input
        label="Photo or PDF"
        name="file"
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        hint="Optional. Max 8MB. Private to your household."
      />

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : documentId ? "Save changes" : "Save paper"}
      </Button>
    </form>
  );
}
