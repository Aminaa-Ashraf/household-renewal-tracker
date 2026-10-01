import "server-only";

import { hash, compare } from "bcryptjs";
import { db } from "@/lib/db";
import { canManageFamily } from "@/lib/roles";
import { requireFamilyMembership } from "@/server/family";

const DEFAULT_WINDOWS = [30, 7, 1, 0];

export async function getOrCreateReminderPreference(userId: string) {
  return db.reminderPreference.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      windows: DEFAULT_WINDOWS,
    },
  });
}

export async function getOrCreateUserPreference(userId: string) {
  return db.userPreference.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
    },
  });
}

export async function updateReminderPreference(
  userId: string,
  input: {
    emailEnabled?: boolean;
    windows?: number[];
    weeklyDigest?: boolean;
    weeklyDigestDay?: number;
    timezone?: string;
    quietHoursStart?: number | null;
    quietHoursEnd?: number | null;
  },
) {
  await getOrCreateReminderPreference(userId);
  return db.reminderPreference.update({
    where: { userId },
    data: {
      emailEnabled: input.emailEnabled,
      windows: input.windows,
      weeklyDigest: input.weeklyDigest,
      weeklyDigestDay: input.weeklyDigestDay,
      timezone: input.timezone,
      quietHoursStart: input.quietHoursStart,
      quietHoursEnd: input.quietHoursEnd,
    },
  });
}

export async function updateUserPreference(
  userId: string,
  input: { language?: string; dateFormat?: string; theme?: string },
) {
  await getOrCreateUserPreference(userId);
  return db.userPreference.update({
    where: { userId },
    data: input,
  });
}

export async function updateAccountName(userId: string, name: string) {
  return db.user.update({
    where: { id: userId },
    data: { name: name.trim() },
  });
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user?.passwordHash) throw new Error("OAUTH_ONLY");

  const ok = await compare(currentPassword, user.passwordHash);
  if (!ok) throw new Error("BAD_PASSWORD");

  const passwordHash = await hash(newPassword, 12);
  return db.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function invalidateOtherSessions(userId: string) {
  return db.user.update({
    where: { id: userId },
    data: { sessionsInvalidBefore: new Date() },
  });
}

export async function getSettingsBundle(userId: string) {
  const membership = await requireFamilyMembership(userId);
  const [user, reminderPreference, userPreference, paperCount, memberCount] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          accounts: { select: { provider: true } },
        },
      }),
      getOrCreateReminderPreference(userId),
      getOrCreateUserPreference(userId),
      db.document.count({
        where: { familyId: membership.familyId, deletedAt: null },
      }),
      db.membership.count({
        where: { familyId: membership.familyId, status: "ACTIVE" },
      }),
    ]);

  return {
    membership,
    user,
    reminderPreference,
    userPreference,
    paperCount,
    memberCount,
    isOwner: canManageFamily(membership.role),
  };
}

export async function exportPapersCsv(userId: string) {
  const membership = await requireFamilyMembership(userId);
  const docs = await db.document.findMany({
    where: { familyId: membership.familyId, deletedAt: null },
    include: { person: true },
    orderBy: { expiryDate: "asc" },
  });

  const header = [
    "title",
    "type",
    "person",
    "relation",
    "expiryDate",
    "status",
    "notes",
  ];
  const rows = docs.map((doc) =>
    [
      doc.title,
      doc.type,
      doc.person.name,
      doc.person.relation,
      doc.expiryDate.toISOString().slice(0, 10),
      doc.status,
      (doc.notes ?? "").replaceAll('"', '""'),
    ]
      .map((value) => `"${String(value)}"`)
      .join(","),
  );

  return [header.join(","), ...rows].join("\n");
}
