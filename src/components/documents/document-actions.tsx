"use client";

import { useState } from "react";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";

export function DocumentActions({
  documentId,
  canEdit,
}: {
  documentId: string;
  canEdit: boolean;
}) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState<"renew" | "delete">();

  if (!canEdit) return null;

  async function markRenewed() {
    setError(undefined);
    setPending("renew");
    const response = await fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "RENEWED" }),
    });
    setPending(undefined);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(data?.error ?? "Could not mark as renewed.");
      return;
    }
    window.location.reload();
  }

  async function removePaper() {
    if (!window.confirm("Delete this paper? You can no longer see it on Home.")) {
      return;
    }
    setError(undefined);
    setPending("delete");
    const response = await fetch(`/api/documents/${documentId}`, {
      method: "DELETE",
    });
    setPending(undefined);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(data?.error ?? "Could not delete the paper.");
      return;
    }
    window.location.assign("/dashboard");
  }

  return (
    <div className="grid gap-3">
      <FormError message={error} />
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={markRenewed}
          disabled={Boolean(pending)}
        >
          {pending === "renew" ? "Saving…" : "Mark renewed"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={removePaper}
          disabled={Boolean(pending)}
        >
          {pending === "delete" ? "Deleting…" : "Delete paper"}
        </Button>
      </div>
    </div>
  );
}
