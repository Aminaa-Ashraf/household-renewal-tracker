import type { Metadata } from "next";
import { headers } from "next/headers";
import { SettingsBoard } from "@/components/settings/settings-board";
import { getSettingsBundle } from "@/server/preferences";
import { requireSession } from "@/server/session";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await requireSession();
  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") ?? "This browser";
  const bundle = await getSettingsBundle(session.user.id);

  if (!bundle.user) {
    return null;
  }

  return (
    <SettingsBoard
      currentUserId={session.user.id}
      role={bundle.membership.role}
      familyName={bundle.membership.family.name}
      memberCount={bundle.memberCount}
      paperCount={bundle.paperCount}
      user={{
        name: bundle.user.name,
        email: bundle.user.email,
        hasPassword: Boolean(bundle.user.passwordHash),
        providers: bundle.user.accounts.map((a) => a.provider),
      }}
      reminder={{
        emailEnabled: bundle.reminderPreference.emailEnabled,
        windows: bundle.reminderPreference.windows,
        weeklyDigest: bundle.reminderPreference.weeklyDigest,
        weeklyDigestDay: bundle.reminderPreference.weeklyDigestDay,
        timezone: bundle.reminderPreference.timezone,
        quietHoursStart: bundle.reminderPreference.quietHoursStart,
        quietHoursEnd: bundle.reminderPreference.quietHoursEnd,
      }}
      preferences={{
        dateFormat: bundle.userPreference.dateFormat,
        theme: bundle.userPreference.theme,
      }}
      currentDevice={{
        label: userAgent.slice(0, 80),
        lastActive: new Date().toISOString(),
        thisDevice: true,
      }}
    />
  );
}
