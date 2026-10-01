import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AcceptInviteButton } from "@/components/family/accept-invite-button";
import { roleLabel } from "@/lib/roles";
import { getInviteByToken } from "@/server/invites";
import { requireSession } from "@/server/session";

type Params = { params: Promise<{ token: string }> };

export const metadata: Metadata = {
  title: "Accept invite",
};

export default async function AcceptInvitePage({ params }: Params) {
  const session = await requireSession();
  const { token } = await params;
  const invite = await getInviteByToken(token);

  if (!invite) {
    return (
      <AuthCard title="Invite not found">
        <p className="text-ink-muted">
          This link is invalid. Ask the household owner to send a new invite.
        </p>
      </AuthCard>
    );
  }

  if (invite.acceptedAt) {
    return (
      <AuthCard title="Invite already used">
        <p className="text-ink-muted">
          This invite was already accepted.{" "}
          <Link href="/dashboard" className="underline">
            Open the dashboard
          </Link>
          .
        </p>
      </AuthCard>
    );
  }

  if (invite.expiresAt < new Date()) {
    return (
      <AuthCard title="Invite expired">
        <p className="text-ink-muted">
          Ask the owner of {invite.family.name} to send a fresh invite.
        </p>
      </AuthCard>
    );
  }

  const emailMatches =
    session.user.email?.toLowerCase() === invite.email.toLowerCase();

  return (
    <AuthCard title={`Join ${invite.family.name}`}>
      <div className="grid gap-4">
        <p className="text-ink-muted">
          {invite.invitedBy.name ?? invite.invitedBy.email} invited{" "}
          <strong>{invite.email}</strong> as {roleLabel(invite.role)}.
        </p>
        {!emailMatches ? (
          <p role="alert" className="rounded-xl bg-crimson-soft px-4 py-3 text-sm text-crimson">
            You are signed in as {session.user.email}. Sign in with{" "}
            {invite.email} to accept.
          </p>
        ) : (
          <AcceptInviteButton token={token} />
        )}
      </div>
    </AuthCard>
  );
}
