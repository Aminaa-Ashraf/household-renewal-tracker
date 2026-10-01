import type { Metadata } from "next";
import { FamilyBoard } from "@/components/family/family-board";
import { getFamilyWithMembers, requireFamilyMembership } from "@/server/family";
import { requireSession } from "@/server/session";

export const metadata: Metadata = {
  title: "Family",
};

export default async function FamilyPage() {
  const session = await requireSession();
  const membership = await requireFamilyMembership(session.user.id);
  const family = await getFamilyWithMembers(membership.familyId);

  if (!family) {
    return null;
  }

  return (
    <FamilyBoard
      familyName={family.name}
      currentUserId={session.user.id}
      role={membership.role}
      profiles={family.profiles.map((profile) => ({
        id: profile.id,
        name: profile.name,
        relation: profile.relation,
        avatarColor: profile.avatarColor,
        linkedUserId: profile.linkedUserId,
        documents: profile.documents.map((doc) => ({
          id: doc.id,
          title: doc.title,
          type: doc.type,
          expiryDate: doc.expiryDate.toISOString(),
        })),
      }))}
      members={family.memberships.map((member) => ({
        id: member.id,
        role: member.role,
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
        },
      }))}
      invites={family.invites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        token: invite.token,
        createdAt: invite.createdAt.toISOString(),
        expiresAt: invite.expiresAt.toISOString(),
      }))}
    />
  );
}
