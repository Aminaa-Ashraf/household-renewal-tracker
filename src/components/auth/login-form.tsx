"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({
  googleEnabled,
  magicLinkEnabled,
}: {
  googleEnabled: boolean;
  magicLinkEnabled: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [error, setError] = useState<string>();
  const [info, setInfo] = useState<string>();
  const [pending, setPending] = useState<"password" | "google" | "magic">();

  async function onPasswordSubmit(formData: FormData) {
    setError(undefined);
    setInfo(undefined);
    setPending("password");

    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
      callbackUrl,
    });

    setPending(undefined);

    if (result?.error) {
      setError("Email or password is wrong.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  async function onGoogle() {
    setError(undefined);
    setPending("google");
    await signIn("google", { callbackUrl });
  }

  async function onMagicLink(formData: FormData) {
    setError(undefined);
    setInfo(undefined);
    setPending("magic");

    const result = await signIn("resend", {
      email: String(formData.get("magicEmail") ?? ""),
      redirect: false,
      callbackUrl,
    });

    setPending(undefined);

    if (result?.error) {
      setError("Could not send the sign-in email.");
      return;
    }

    setInfo("Check your email for a sign-in link.");
  }

  return (
    <div className="grid gap-6">
      <FormError message={error} />
      {info ? (
        <p className="rounded-xl bg-olive-soft px-4 py-3 text-sm text-olive">
          {info}
        </p>
      ) : null}

      <form action={onPasswordSubmit} className="grid gap-4">
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
          autoComplete="current-password"
          required
        />
        <Button type="submit" disabled={Boolean(pending)}>
          {pending === "password" ? "Signing in…" : "Sign in"}
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

      {magicLinkEnabled ? (
        <form action={onMagicLink} className="grid gap-3 border-t border-rule pt-6">
          <Input
            label="Or email a sign-in link"
            name="magicEmail"
            type="email"
            autoComplete="email"
            required
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={Boolean(pending)}
          >
            {pending === "magic" ? "Sending…" : "Email me a link"}
          </Button>
        </form>
      ) : null}

      <p className="text-sm text-ink-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-accent underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
