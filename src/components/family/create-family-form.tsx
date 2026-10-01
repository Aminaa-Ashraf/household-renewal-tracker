"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateFamilyForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(undefined);
    setPending(true);

    const response = await fetch("/api/families", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setPending(false);
      setError(data?.error ?? "Could not create the household.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      <FormError message={error} />
      <Input
        label="Household name"
        name="name"
        placeholder="Khan Household"
        hint="Use your family name so everyone recognises it."
        required
        minLength={2}
        maxLength={80}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Creating household…" : "Create household"}
      </Button>
    </form>
  );
}
