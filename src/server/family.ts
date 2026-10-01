import "server-only";

import { db } from "@/lib/db";

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
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      invites: {
        where: { acceptedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function leaveFamily(userId: string) {
  const membership = await requireFamilyMembership(userId);

  if (membership.role === "OWNER") {
    const otherOwners = await db.membership.count({
      where: {
        familyId: membership.familyId,
        status: "ACTIVE",
        role: "OWNER",
        userId: { not: userId },
      },
    });

    if (otherOwners === 0) {
      const otherMembers = await db.membership.count({
        where: {
          familyId: membership.familyId,
          status: "ACTIVE",
          userId: { not: userId },
        },
      });

      if (otherMembers > 0) {
        throw new Error("OWNER_CANNOT_LEAVE");
      }
    }
  }

  return db.membership.update({
    where: { id: membership.id },
    data: { status: "LEFT" },
  });
}
