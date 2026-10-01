"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignupForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState<"password" | "google">();

  async function onSubmit(formData: FormData) {
    setError(undefined);
    setPending("password");

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setPending(undefined);
      setError(data?.error ?? "Could not create the account.");
      return;
    }

    const result = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
      callbackUrl: "/onboarding",
    });

    setPending(undefined);

    if (result?.error) {
      setError("Account created. Sign in from the login page.");
      return;
    }

    window.location.assign(result?.url ?? "/onboarding");
  }

  async function onGoogle() {
    setError(undefined);
    setPending("google");
    await signIn("google", { callbackUrl: "/onboarding" });
  }

  return (
    <div className="grid gap-6">
      <FormError message={error} />

      <form action={onSubmit} className="grid gap-4">
        <Input
          label="Your name"
          name="name"
          autoComplete="name"
          required
          minLength={2}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          required
          minLength={8}
        />
        <Button type="submit" disabled={Boolean(pending)}>
          {pending === "password" ? "Creating account…" : "Create account"}
        </Button>
      </form>

      {googleEnabled ? (
        <Button
          type="button"
          variant="secondary"
          onClick={onGoogle}
          disabled={Boolean(pending)}
        >
          {pending === "google" ? "Opening Google…" : "Continue with Google"}
        </Button>
      ) : null}

      <p className="text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-terracotta underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
