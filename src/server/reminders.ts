import "server-only";

import type { ReminderWindow } from "@prisma/client";
import { db } from "@/lib/db";
import { addDays, daysUntil, formatLongDate, formatRelativeExpiry } from "@/lib/dates";
import { sendReminderEmail } from "@/server/email";

type ReminderCandidate = {
  window: ReminderWindow;
  label: string;
  matches: (days: number, document: { remind30: boolean; remind7: boolean; remind1: boolean }) => boolean;
};

const WINDOWS: ReminderCandidate[] = [
  {
    window: "DAYS_30",
    label: "30 days before",
    matches: (days, doc) => doc.remind30 && days === 30,
  },
  {
    window: "DAYS_7",
    label: "7 days before",
    matches: (days, doc) => doc.remind7 && days === 7,
  },
  {
    window: "DAYS_1",
    label: "1 day before",
    matches: (days, doc) => doc.remind1 && days === 1,
  },
  {
    window: "EXPIRY",
    label: "expiry day",
    matches: (days) => days === 0,
  },
];

export async function runDailyReminders(now = new Date()) {
  const documents = await db.document.findMany({
    where: {
      deletedAt: null,
      status: { in: ["ACTIVE", "EXPIRED"] },
      expiryDate: {
        gte: addDays(now, -1),
        lte: addDays(now, 30),
      },
    },
    include: {
      person: { select: { id: true, name: true } },
      family: {
        include: {
          memberships: {
            where: { status: "ACTIVE" },
            include: {
              user: { select: { id: true, email: true, name: true } },
            },
          },
        },
      },
      reminders: true,
    },
  });

  let sent = 0;
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  for (const document of documents) {
    const days = daysUntil(document.expiryDate, now);

    for (const candidate of WINDOWS) {
      if (!candidate.matches(days, document)) continue;

      const alreadySent = document.reminders.some(
        (log) =>
          log.window === candidate.window &&
          log.expiryDate.getTime() === document.expiryDate.getTime(),
      );
      if (alreadySent) continue;

      const recipients = new Map<string, string>();
      for (const membership of document.family.memberships) {
        if (membership.user.email) {
          recipients.set(membership.user.email, membership.user.name ?? membership.user.email);
        }
      }

      for (const email of recipients.keys()) {
        await sendReminderEmail({
          to: email,
          documentTitle: document.title,
          personName: document.person.name || "Family member",
          relative: formatRelativeExpiry(document.expiryDate, now),
          absoluteDate: formatLongDate(document.expiryDate),
          windowLabel: candidate.label,
          documentUrl: `${baseUrl}/documents/${document.id}`,
        });
      }

      await db.reminderLog.create({
        data: {
          documentId: document.id,
          window: candidate.window,
          expiryDate: document.expiryDate,
        },
      });

      sent += 1;
    }
  }

  return { checked: documents.length, sent };
}
