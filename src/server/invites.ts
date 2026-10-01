import "server-only";

import { randomBytes } from "crypto";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { canManageFamily } from "@/lib/roles";
import { addDays } from "@/lib/dates";
import { getActiveMembership, requireFamilyMembership } from "@/server/family";
import { sendInviteEmail } from "@/server/email";

export async function createInvite(
  userId: string,
  input: { email: string; role: Exclude<Role, "OWNER"> },
) {
  const membership = await requireFamilyMembership(userId);

  if (!canManageFamily(membership.role)) {
    throw new Error("FORBIDDEN");
  }

  const existingUser = await db.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    const alreadyMember = await db.membership.findFirst({
      where: {
        userId: existingUser.id,
        status: "ACTIVE",
      },
    });
    if (alreadyMember) {
      throw new Error("ALREADY_IN_FAMILY");
    }
  }

  const token = randomBytes(24).toString("hex");
  const invite = await db.invite.create({
    data: {
      familyId: membership.familyId,
      email: input.email,
      role: input.role,
      token,
      invitedById: userId,
      expiresAt: addDays(new Date(), 7),
    },
    include: {
      family: true,
      invitedBy: { select: { name: true, email: true } },
    },
  });

  const acceptUrl = inviteUrl(invite.token);
  await sendInviteEmail({
    to: invite.email,
    familyName: invite.family.name,
    invitedByName: invite.invitedBy.name ?? invite.invitedBy.email ?? "A family member",
    acceptUrl,
    role: invite.role,
  });

  return { ...invite, acceptUrl };
}

export function inviteUrl(token: string) {
  return `${process.env.AUTH_URL ?? "http://localhost:3000"}/invites/${token}`;
}

export async function getInviteByToken(token: string) {
  return db.invite.findUnique({
    where: { token },
    include: {
      family: true,
      invitedBy: { select: { name: true, email: true } },
    },
  });
}

export async function acceptInvite(userId: string, token: string) {
  const invite = await getInviteByToken(token);
  if (!invite) throw new Error("NOT_FOUND");
  if (invite.acceptedAt) throw new Error("ALREADY_ACCEPTED");
  if (invite.revokedAt) throw new Error("REVOKED");
  if (invite.expiresAt < new Date()) throw new Error("EXPIRED");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user?.email) throw new Error("NO_EMAIL");
  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw new Error("EMAIL_MISMATCH");
  }

  const existing = await getActiveMembership(userId);
  if (existing) throw new Error("ALREADY_IN_FAMILY");

  return db.$transaction(async (tx) => {
    await tx.invite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });

    const previous = await tx.membership.findUnique({
      where: {
        userId_familyId: {
          userId,
          familyId: invite.familyId,
        },
      },
    });

    const membership = previous
      ? await tx.membership.update({
          where: { id: previous.id },
          data: { status: "ACTIVE", role: invite.role },
          include: { family: true },
        })
      : await tx.membership.create({
          data: {
            userId,
            familyId: invite.familyId,
            role: invite.role,
            status: "ACTIVE",
          },
          include: { family: true },
        });

    const linked = await tx.familyProfile.findFirst({
      where: { familyId: invite.familyId, linkedUserId: userId },
    });
    if (!linked) {
      await tx.familyProfile.create({
        data: {
          familyId: invite.familyId,
          name: user.name?.trim() || user.email.split("@")[0] || "Member",
          relation: "OTHER",
          avatarColor: "#2A6F97",
          linkedUserId: userId,
        },
      });
    }

    return membership;
  });
}

export async function cancelInvite(userId: string, inviteId: string) {
  const membership = await requireFamilyMembership(userId);
  if (!canManageFamily(membership.role)) {
    throw new Error("FORBIDDEN");
  }

  const invite = await db.invite.findFirst({
    where: {
      id: inviteId,
      familyId: membership.familyId,
      acceptedAt: null,
    },
  });

  if (!invite) throw new Error("NOT_FOUND");

  await db.invite.update({
    where: { id: invite.id },
    data: { revokedAt: new Date() },
  });
}

export async function resendInvite(userId: string, inviteId: string) {
  const membership = await requireFamilyMembership(userId);
  if (!canManageFamily(membership.role)) throw new Error("FORBIDDEN");

  const existing = await db.invite.findFirst({
    where: {
      id: inviteId,
      familyId: membership.familyId,
      acceptedAt: null,
      revokedAt: null,
    },
    include: {
      family: true,
      invitedBy: { select: { name: true, email: true } },
    },
  });
  if (!existing) throw new Error("NOT_FOUND");

  const token = randomBytes(24).toString("hex");
  const invite = await db.invite.update({
    where: { id: existing.id },
    data: {
      token,
      expiresAt: addDays(new Date(), 7),
      createdAt: new Date(),
    },
    include: {
      family: true,
      invitedBy: { select: { name: true, email: true } },
    },
  });

  const acceptUrl = inviteUrl(invite.token);
  await sendInviteEmail({
    to: invite.email,
    familyName: invite.family.name,
    invitedByName: invite.invitedBy.name ?? invite.invitedBy.email ?? "A family member",
    acceptUrl,
    role: invite.role,
  });

  return { ...invite, acceptUrl };
}
