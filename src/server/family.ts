import "server-only";

import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { canManageFamily } from "@/lib/roles";
import { nextAvatarColor } from "@/server/profiles";

export async function getActiveMembership(userId: string) {
  return db.membership.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { family: true },
  });
}

export async function requireFamilyMembership(userId: string) {
  const membership = await getActiveMembership(userId);
  if (!membership) {
    throw new Error("NO_FAMILY");
  }
  return membership;
}

export async function createFamily(userId: string, name: string) {
  const existing = await getActiveMembership(userId);
  if (existing) {
    throw new Error("ALREADY_IN_FAMILY");
  }

  const user = await db.user.findUnique({ where: { id: userId } });

  return db.$transaction(async (tx) => {
    const family = await tx.family.create({
      data: { name },
    });

    await tx.membership.create({
      data: {
        userId,
        familyId: family.id,
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    await tx.familyProfile.create({
      data: {
        familyId: family.id,
        name: user?.name?.trim() || "Me",
        relation: "OTHER",
        avatarColor: nextAvatarColor(0),
        linkedUserId: userId,
      },
    });

    return family;
  });
}

export async function getFamilyWithMembers(familyId: string) {
  return db.family.findUnique({
    where: { id: familyId },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        include: {
          user: {
            select: { id: true, name: true, email: true, passwordHash: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      invites: {
        where: { acceptedAt: null, revokedAt: null },
        orderBy: { createdAt: "desc" },
      },
      profiles: {
        include: {
          linkedUser: { select: { id: true, name: true, email: true } },
          documents: {
            where: { deletedAt: null },
            select: { id: true, title: true, type: true, expiryDate: true },
            orderBy: { expiryDate: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { documents: true, memberships: true } },
    },
  });
}

export async function renameFamily(userId: string, name: string) {
  const membership = await requireFamilyMembership(userId);
  if (!canManageFamily(membership.role)) throw new Error("FORBIDDEN");

  return db.family.update({
    where: { id: membership.familyId },
    data: { name: name.trim() },
  });
}

export async function changeMemberRole(
  actorId: string,
  targetUserId: string,
  role: Role,
) {
  const membership = await requireFamilyMembership(actorId);
  if (!canManageFamily(membership.role)) throw new Error("FORBIDDEN");
  if (targetUserId === actorId) throw new Error("CANNOT_CHANGE_SELF");

  const target = await db.membership.findFirst({
    where: {
      familyId: membership.familyId,
      userId: targetUserId,
      status: "ACTIVE",
    },
  });
  if (!target) throw new Error("NOT_FOUND");
  if (target.role === "OWNER" && role !== "OWNER") {
    throw new Error("USE_TRANSFER");
  }

  return db.membership.update({
    where: { id: target.id },
    data: { role },
  });
}

export async function removeMember(actorId: string, targetUserId: string) {
  const membership = await requireFamilyMembership(actorId);
  if (!canManageFamily(membership.role)) throw new Error("FORBIDDEN");
  if (targetUserId === actorId) throw new Error("CANNOT_REMOVE_SELF");

  const target = await db.membership.findFirst({
    where: {
      familyId: membership.familyId,
      userId: targetUserId,
      status: "ACTIVE",
    },
  });
  if (!target) throw new Error("NOT_FOUND");
  if (target.role === "OWNER") throw new Error("CANNOT_REMOVE_OWNER");

  await db.familyProfile.updateMany({
    where: { familyId: membership.familyId, linkedUserId: targetUserId },
    data: { linkedUserId: null },
  });

  return db.membership.update({
    where: { id: target.id },
    data: { status: "LEFT" },
  });
}

export async function transferOwnership(actorId: string, targetUserId: string) {
  const membership = await requireFamilyMembership(actorId);
  if (!canManageFamily(membership.role)) throw new Error("FORBIDDEN");
  if (targetUserId === actorId) throw new Error("CANNOT_TRANSFER_SELF");

  const target = await db.membership.findFirst({
    where: {
      familyId: membership.familyId,
      userId: targetUserId,
      status: "ACTIVE",
    },
  });
  if (!target) throw new Error("NOT_FOUND");

  return db.$transaction(async (tx) => {
    await tx.membership.update({
      where: { id: membership.id },
      data: { role: "MEMBER" },
    });
    return tx.membership.update({
      where: { id: target.id },
      data: { role: "OWNER" },
    });
  });
}

export async function leaveFamily(userId: string) {
  const membership = await requireFamilyMembership(userId);

  if (membership.role === "OWNER") {
    throw new Error("OWNER_CANNOT_LEAVE");
  }

  await db.familyProfile.updateMany({
    where: { familyId: membership.familyId, linkedUserId: userId },
    data: { linkedUserId: null },
  });

  return db.membership.update({
    where: { id: membership.id },
    data: { status: "LEFT" },
  });
}

export async function deleteHousehold(userId: string, confirmName: string) {
  const membership = await requireFamilyMembership(userId);
  if (!canManageFamily(membership.role)) throw new Error("FORBIDDEN");

  const family = await db.family.findUnique({ where: { id: membership.familyId } });
  if (!family) throw new Error("NOT_FOUND");
  if (family.name.trim() !== confirmName.trim()) throw new Error("NAME_MISMATCH");

  await db.family.delete({ where: { id: family.id } });
}

export async function deleteAccount(userId: string, confirmEmail: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("NOT_FOUND");
  if (user.email.toLowerCase() !== confirmEmail.trim().toLowerCase()) {
    throw new Error("EMAIL_MISMATCH");
  }

  const membership = await getActiveMembership(userId);

  if (membership?.role === "OWNER") {
    const otherMembers = await db.membership.count({
      where: {
        familyId: membership.familyId,
        status: "ACTIVE",
        userId: { not: userId },
      },
    });
    if (otherMembers > 0) {
      throw new Error("OWNER_WITH_MEMBERS");
    }
    // Sole owner: remove the household (and its papers), then the account.
    await db.family.delete({ where: { id: membership.familyId } });
  } else if (membership) {
    const owner = await db.membership.findFirst({
      where: {
        familyId: membership.familyId,
        role: "OWNER",
        status: "ACTIVE",
      },
      select: { userId: true },
    });
    const fallbackId = owner?.userId;
    if (fallbackId) {
      await db.document.updateMany({
        where: { createdById: userId },
        data: { createdById: fallbackId },
      });
      await db.document.updateMany({
        where: { updatedById: userId },
        data: { updatedById: fallbackId },
      });
      await db.invite.updateMany({
        where: { invitedById: userId },
        data: { invitedById: fallbackId },
      });
    }
    await db.document.updateMany({
      where: { renewedById: userId },
      data: { renewedById: null },
    });
    await leaveFamily(userId);
  }

  // Clear any leftover authorship refs outside an active household.
  await db.document.updateMany({
    where: { renewedById: userId },
    data: { renewedById: null },
  });
  await db.document.updateMany({
    where: { updatedById: userId },
    data: { updatedById: null },
  });

  const orphanDocs = await db.document.findMany({
    where: { createdById: userId },
    select: { id: true, familyId: true },
  });
  for (const doc of orphanDocs) {
    const owner = await db.membership.findFirst({
      where: {
        familyId: doc.familyId,
        role: "OWNER",
        status: "ACTIVE",
        userId: { not: userId },
      },
      select: { userId: true },
    });
    if (owner) {
      await db.document.update({
        where: { id: doc.id },
        data: { createdById: owner.userId },
      });
    } else {
      await db.document.delete({ where: { id: doc.id } });
    }
  }

  const orphanInvites = await db.invite.findMany({
    where: { invitedById: userId },
    select: { id: true, familyId: true },
  });
  for (const invite of orphanInvites) {
    const owner = await db.membership.findFirst({
      where: {
        familyId: invite.familyId,
        role: "OWNER",
        status: "ACTIVE",
        userId: { not: userId },
      },
      select: { userId: true },
    });
    if (owner) {
      await db.invite.update({
        where: { id: invite.id },
        data: { invitedById: owner.userId },
      });
    } else {
      await db.invite.delete({ where: { id: invite.id } });
    }
  }

  await db.user.delete({ where: { id: userId } });
}
