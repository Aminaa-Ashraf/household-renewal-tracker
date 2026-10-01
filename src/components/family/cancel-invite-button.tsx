"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CancelInviteButton({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onCancel() {
    setPending(true);
    await fetch(`/api/invites?id=${inviteId}`, { method: "DELETE" });
    router.refresh();
    setPending(false);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onCancel}
      disabled={pending}
    >
      {pending ? "Cancelling…" : "Cancel"}
    </Button>
  );
}
