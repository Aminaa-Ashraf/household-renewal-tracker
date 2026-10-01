import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { sendReminderEmail } from "@/server/email";
import {
  changePassword,
  exportPapersCsv,
  getSettingsBundle,
  invalidateOtherSessions,
  updateAccountName,
  updateReminderPreference,
  updateUserPreference,
} from "@/server/preferences";
import { deleteAccount } from "@/server/family";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") ?? "This browser";
  const bundle = await getSettingsBundle(session.user.id);

  return NextResponse.json({
    ...bundle,
    currentDevice: {
      label: userAgent.slice(0, 80),
      lastActive: new Date().toISOString(),
      thisDevice: true,
    },
    user: bundle.user
      ? {
          id: bundle.user.id,
          name: bundle.user.name,
          email: bundle.user.email,
          hasPassword: Boolean(bundle.user.passwordHash),
          providers: bundle.user.accounts.map((a) => a.provider),
        }
      : null,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = z
    .object({
      section: z.enum(["account", "reminders", "preferences", "sessions"]),
      name: z.string().optional(),
      reminder: z
        .object({
          emailEnabled: z.boolean().optional(),
          windows: z.array(z.number()).optional(),
          weeklyDigest: z.boolean().optional(),
          weeklyDigestDay: z.number().optional(),
          timezone: z.string().optional(),
          quietHoursStart: z.number().nullable().optional(),
          quietHoursEnd: z.number().nullable().optional(),
        })
        .optional(),
      preferences: z
        .object({
          language: z.string().optional(),
          dateFormat: z.string().optional(),
          theme: z.string().optional(),
        })
        .optional(),
      invalidateOthers: z.boolean().optional(),
    })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });
  }

  try {
    if (parsed.data.section === "account" && parsed.data.name) {
      await updateAccountName(session.user.id, parsed.data.name);
    }
    if (parsed.data.section === "reminders" && parsed.data.reminder) {
      await updateReminderPreference(session.user.id, parsed.data.reminder);
    }
    if (parsed.data.section === "preferences" && parsed.data.preferences) {
      await updateUserPreference(session.user.id, parsed.data.preferences);
    }
    if (parsed.data.section === "sessions" && parsed.data.invalidateOthers) {
      await invalidateOtherSessions(session.user.id);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save settings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action === "test-reminder") {
    if (!session.user.email) {
      return NextResponse.json({ error: "No email on this account." }, { status: 400 });
    }
    await sendReminderEmail({
      to: session.user.email,
      documentTitle: "Test reminder",
      personName: session.user.name ?? "You",
      relative: "is a test",
      absoluteDate: new Date().toLocaleDateString("en-GB"),
      windowLabel: "test",
      documentUrl: `${process.env.AUTH_URL ?? "http://localhost:3000"}/dashboard`,
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "change-password") {
    try {
      await changePassword(
        session.user.id,
        String(body.currentPassword ?? ""),
        String(body.newPassword ?? ""),
      );
      return NextResponse.json({ ok: true });
    } catch (error) {
      if (error instanceof Error && error.message === "OAUTH_ONLY") {
        return NextResponse.json(
          { error: "This account uses Google sign-in." },
          { status: 400 },
        );
      }
      if (error instanceof Error && error.message === "BAD_PASSWORD") {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: "Could not change password." }, { status: 500 });
    }
  }

  if (action === "export-csv") {
    const csv = await exportPapersCsv(session.user.id);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="household-papers.csv"',
      },
    });
  }

  if (action === "delete-account") {
    try {
      await deleteAccount(session.user.id, String(body.confirmEmail ?? ""));
      return NextResponse.json({ ok: true });
    } catch (error) {
      if (error instanceof Error && error.message === "OWNER_WITH_MEMBERS") {
        return NextResponse.json(
          {
            error:
              "Transfer ownership to someone else before deleting your account.",
          },
          { status: 409 },
        );
      }
      if (error instanceof Error && error.message === "SOLE_OWNER_BLOCKED") {
        return NextResponse.json(
          {
            error:
              "Transfer ownership or delete the household before deleting your account.",
          },
          { status: 409 },
        );
      }
      if (error instanceof Error && error.message === "EMAIL_MISMATCH") {
        return NextResponse.json(
          { error: "Type your email exactly to confirm." },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: "Could not delete account." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
