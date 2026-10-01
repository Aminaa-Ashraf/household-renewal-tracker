"use client";

import { useState } from "react";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InviteForm() {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(undefined);
    setPending(true);

    const response = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        role: String(formData.get("role") ?? "MEMBER"),
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setPending(false);
      setError(data?.error ?? "Could not send invite.");
      return;
    }

    window.location.reload();
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      <FormError message={error} />
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="family@example.com"
        required
      />
      <div className="grid gap-2">
        <label htmlFor="role" className="text-sm font-medium">
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue="MEMBER"
          className="min-h-12 rounded-xl border border-rule bg-paper-raised px-3 text-base"
        >
          <option value="MEMBER">Member — can add and edit papers</option>
          <option value="VIEWER">Viewer — can see and get reminders</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending invite…" : "Send invite"}
      </Button>
    </form>
  );
}
