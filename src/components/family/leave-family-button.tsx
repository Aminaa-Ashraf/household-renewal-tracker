"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";

export function LeaveFamilyButton() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onLeave() {
    if (
      !window.confirm(
        "Leave this household? Papers you do not own stay with the family.",
      )
    ) {
      return;
    }

    setError(undefined);
    setPending(true);
    const response = await fetch("/api/families/leave", { method: "POST" });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setPending(false);
      setError(data?.error ?? "Could not leave the household.");
      return;
    }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div className="grid gap-3">
      <FormError message={error} />
      <Button
        type="button"
        variant="secondary"
        onClick={onLeave}
        disabled={pending}
      >
        {pending ? "Leaving…" : "Leave household"}
      </Button>
    </div>
  );
}
