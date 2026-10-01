"use client";

import { useState } from "react";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";

export function AcceptInviteButton({ token }: { token: string }) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onAccept() {
    setError(undefined);
    setPending(true);
    const response = await fetch("/api/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setPending(false);
      setError(data?.error ?? "Could not accept invite.");
      return;
    }

    window.location.assign("/dashboard");
  }

  return (
    <div className="grid gap-3">
      <FormError message={error} />
      <Button type="button" onClick={onAccept} disabled={pending}>
        {pending ? "Joining…" : "Accept invite"}
      </Button>
    </div>
  );
}
