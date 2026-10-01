import type { Metadata } from "next";
import { CancelInviteButton } from "@/components/family/cancel-invite-button";
import { InviteForm } from "@/components/family/invite-form";
import { LeaveFamilyButton } from "@/components/family/leave-family-button";
import { Card, CardTitle } from "@/components/ui/card";
import { formatLongDate } from "@/lib/dates";
import { canManageFamily, roleLabel } from "@/lib/roles";
import { getFamilyWithMembers, requireFamilyMembership } from "@/server/family";
import { requireSession } from "@/server/session";

export const metadata: Metadata = {
  title: "Family",
};

export default async function FamilyPage() {
  const session = await requireSession();
  const membership = await requireFamilyMembership(session.user.id);
  const family = await getFamilyWithMembers(membership.familyId);
  const isOwner = canManageFamily(membership.role);

  if (!family) {
    return null;
  }

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {family.name}
        </h1>
        <p className="mt-2 text-ink-muted">
          Members share this vault. You are signed in as{" "}
          {roleLabel(membership.role).toLowerCase()}.
        </p>
      </header>

      <Card>
        <CardTitle>Members</CardTitle>
        <ul className="mt-4 grid gap-3">
          {family.memberships.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-rule/70 pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium">
                  {member.user.name ?? member.user.email}
                </p>
                <p className="text-sm text-ink-muted">{member.user.email}</p>
              </div>
              <p className="text-sm font-medium text-terracotta">
                {roleLabel(member.role)}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      {isOwner ? (
        <>
          <Card>
            <CardTitle>Invite someone</CardTitle>
            <p className="mt-2 text-sm text-ink-muted">
              They join with the email you invite. No public family directory.
            </p>
            <div className="mt-4">
              <InviteForm />
            </div>
          </Card>

          {family.invites.length > 0 ? (
            <Card>
              <CardTitle>Open invites</CardTitle>
              <ul className="mt-4 grid gap-3">
                {family.invites.map((invite) => (
                  <li
                    key={invite.id}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-ink-muted">
                        {roleLabel(invite.role)} · expires{" "}
                        {formatLongDate(invite.expiresAt)}
                      </p>
                    </div>
                    <CancelInviteButton inviteId={invite.id} />
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </>
      ) : null}

      <Card>
        <CardTitle>Leave household</CardTitle>
        <p className="mt-2 text-sm text-ink-muted">
          Papers you do not own stay with the family. Soft-deleted papers stay
          hidden.
        </p>
        <div className="mt-4">
          <LeaveFamilyButton />
        </div>
      </Card>
    </div>
  );
}
