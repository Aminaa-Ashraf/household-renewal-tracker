import "server-only";

import type { FamilyRelation } from "@prisma/client";
import { db } from "@/lib/db";
import { canManageFamily, canUploadDocuments } from "@/lib/roles";
import { requireFamilyMembership } from "@/server/family";

const AVATAR_COLORS = [
  "#1F5E4A",
  "#D9534F",
  "#E8A33D",
  "#5B4D8A",
  "#2A6F97",
  "#8DB5A0",
];

export function nextAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]!;
}

export async function listFamilyProfiles(familyId: string) {
  return db.familyProfile.findMany({
    where: { familyId },
    include: {
      linkedUser: { select: { id: true, name: true, email: true } },
      documents: {
        where: { deletedAt: null },
        select: { id: true, title: true, type: true, expiryDate: true },
        orderBy: { expiryDate: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createFamilyProfile(
  userId: string,
  input: { name: string; relation: FamilyRelation; avatarColor?: string },
) {
  const membership = await requireFamilyMembership(userId);
  if (!canUploadDocuments(membership.role)) throw new Error("FORBIDDEN");

  const count = await db.familyProfile.count({
    where: { familyId: membership.familyId },
  });

  return db.familyProfile.create({
    data: {
      familyId: membership.familyId,
      name: input.name.trim(),
      relation: input.relation,
      avatarColor: input.avatarColor ?? nextAvatarColor(count),
    },
  });
}

export async function updateFamilyProfile(
  userId: string,
  profileId: string,
  input: {
    name?: string;
    relation?: FamilyRelation;
    avatarColor?: string;
    linkedUserId?: string | null;
  },
) {
  const membership = await requireFamilyMembership(userId);
  if (!canUploadDocuments(membership.role)) throw new Error("FORBIDDEN");

  const profile = await db.familyProfile.findFirst({
    where: { id: profileId, familyId: membership.familyId },
  });
  if (!profile) throw new Error("NOT_FOUND");

  if (input.linkedUserId) {
    const linkMember = await db.membership.findFirst({
      where: {
        familyId: membership.familyId,
        userId: input.linkedUserId,
        status: "ACTIVE",
      },
    });
    if (!linkMember) throw new Error("INVALID_MEMBER");
  }

  return db.familyProfile.update({
    where: { id: profile.id },
    data: {
      name: input.name?.trim(),
      relation: input.relation,
      avatarColor: input.avatarColor,
      linkedUserId: input.linkedUserId,
    },
  });
}

export async function deleteFamilyProfile(userId: string, profileId: string) {
  const membership = await requireFamilyMembership(userId);
  if (!canManageFamily(membership.role) && membership.role !== "MEMBER") {
    throw new Error("FORBIDDEN");
  }
  if (!canUploadDocuments(membership.role)) throw new Error("FORBIDDEN");

  const profile = await db.familyProfile.findFirst({
    where: { id: profileId, familyId: membership.familyId },
    include: { _count: { select: { documents: true } } },
  });
  if (!profile) throw new Error("NOT_FOUND");

  const activePapers = await db.document.count({
    where: { personId: profile.id, deletedAt: null },
  });
  if (activePapers > 0) throw new Error("HAS_PAPERS");

  await db.familyProfile.delete({ where: { id: profile.id } });
}

export async function ensureOwnerProfile(
  familyId: string,
  userId: string,
  name: string,
) {
  const existing = await db.familyProfile.findFirst({
    where: { familyId, linkedUserId: userId },
  });
  if (existing) return existing;

  return db.familyProfile.create({
    data: {
      familyId,
      name,
      relation: "OTHER",
      avatarColor: nextAvatarColor(0),
      linkedUserId: userId,
    },
  });
}
