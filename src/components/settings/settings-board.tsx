"use client";

import { useEffect, useState } from "react";
import type { Role } from "@prisma/client";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Chip, Switch } from "@/components/ui/controls";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { canManageFamily, roleLabel } from "@/lib/roles";

const REMINDER_WINDOWS = [
  { days: 90, label: "90 days" },
  { days: 60, label: "60 days" },
  { days: 30, label: "30 days" },
  { days: 14, label: "14 days" },
  { days: 7, label: "7 days" },
  { days: 1, label: "1 day" },
  { days: 0, label: "On the day" },
] as const;

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TIMEZONES = [
  "Asia/Karachi",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Europe/London",
  "America/New_York",
  "UTC",
];

type SettingsBoardProps = {
  currentUserId: string;
  role: Role;
  familyName: string;
  memberCount: number;
  paperCount: number;
  user: {
    name: string | null;
    email: string;
    hasPassword: boolean;
    providers: string[];
  };
  reminder: {
    emailEnabled: boolean;
    windows: number[];
    weeklyDigest: boolean;
    weeklyDigestDay: number;
    timezone: string;
    quietHoursStart: number | null;
    quietHoursEnd: number | null;
  };
  preferences: {
    dateFormat: string;
    theme: string;
  };
  currentDevice: {
    label: string;
    lastActive: string;
    thisDevice: boolean;
  };
};

export function SettingsBoard(props: SettingsBoardProps) {
  const { toast } = useToast();
  const isOwner = canManageFamily(props.role);
  const isSoleOwner = isOwner && props.memberCount <= 1;
  const initial = (props.user.name ?? props.user.email).trim().charAt(0).toUpperCase() || "F";

  const [name, setName] = useState(props.user.name ?? "");
  const [editingName, setEditingName] = useState(false);
  const [householdName, setHouseholdName] = useState(props.familyName);
  const [editingHousehold, setEditingHousehold] = useState(false);
  const [reminder, setReminder] = useState(props.reminder);
  const [preferences, setPreferences] = useState(props.preferences);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState<
    | { type: "sign-out-others" }
    | { type: "delete-account" }
    | null
  >(null);
  const [confirmEmail, setConfirmEmail] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    root.lang = "en";
    root.dir = "ltr";
    root.dataset.theme = preferences.theme;
    if (preferences.theme === "dark") {
      root.style.colorScheme = "dark";
    } else if (preferences.theme === "light") {
      root.style.colorScheme = "light";
    } else {
      root.style.colorScheme = "";
    }
  }, [preferences.theme]);

  async function patch(body: Record<string, unknown>) {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      error: typeof data.error === "string" ? data.error : undefined,
    };
  }

  async function saveName() {
    const next = name.trim();
    if (!next) {
      setError("Name cannot be empty.");
      return;
    }
    setPending(true);
    setError(null);
    const previous = props.user.name;
    const result = await patch({ section: "account", name: next });
    setPending(false);
    if (!result.ok) {
      setName(previous ?? "");
      setError(result.error ?? "Could not save name.");
      return;
    }
    setEditingName(false);
    toast("Saved");
  }

  async function saveHouseholdName() {
    const next = householdName.trim();
    if (!next) {
      setError("Household name cannot be empty.");
      return;
    }
    setPending(true);
    setError(null);
    const res = await fetch("/api/families", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "rename", name: next }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setHouseholdName(props.familyName);
      setError(typeof data.error === "string" ? data.error : "Could not rename.");
      return;
    }
    setEditingHousehold(false);
    toast("Saved");
  }

  async function saveReminder(next: typeof reminder) {
    const previous = reminder;
    setReminder(next);
    setError(null);
    const result = await patch({ section: "reminders", reminder: next });
    if (!result.ok) {
      setReminder(previous);
      setError(result.error ?? "Could not save reminders.");
      toast(result.error ?? "Could not save.", "error");
      return;
    }
    toast("Saved");
  }

  async function savePreferences(next: typeof preferences) {
    const previous = preferences;
    setPreferences(next);
    setError(null);
    const result = await patch({ section: "preferences", preferences: next });
    if (!result.ok) {
      setPreferences(previous);
      setError(result.error ?? "Could not save preferences.");
      toast(result.error ?? "Could not save.", "error");
      return;
    }
    toast("Saved");
  }

  function toggleWindow(days: number) {
    const has = reminder.windows.includes(days);
    const windows = has
      ? reminder.windows.filter((w) => w !== days)
      : [...reminder.windows, days].sort((a, b) => b - a);
    void saveReminder({ ...reminder, windows });
  }

  async function sendTestReminder() {
    setPending(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test-reminder" }),
    });
    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(typeof data.error === "string" ? data.error : "Could not send.", "error");
      return;
    }
    toast("Saved");
  }

  async function changePassword() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "change-password",
        currentPassword,
        newPassword,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not change password.");
      return;
    }
    setPasswordOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    toast("Saved");
  }

  async function signOutOthers() {
    setPending(true);
    const result = await patch({
      section: "sessions",
      invalidateOthers: true,
    });
    setPending(false);
    setConfirm(null);
    if (!result.ok) {
      toast(result.error ?? "Could not sign out other devices.", "error");
      return;
    }
    toast("Saved");
  }

  async function exportCsv() {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "export-csv" }),
    });
    if (!res.ok) {
      toast("Could not export CSV.", "error");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "household-papers.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("Saved");
  }

  async function exportPdf() {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "export-csv" }),
    });
    if (!res.ok) {
      toast("Could not prepare PDF.", "error");
      return;
    }
    const csv = await res.text();
    const lines = csv.trim().split("\n").slice(1);
    const rows = lines.map((line) =>
      line
        .match(/("([^"]|"")*"|[^,]+)/g)
        ?.map((cell) => cell.replace(/^"|"$/g, "").replaceAll('""', '"')) ?? [],
    );
    const html = `<!doctype html><html><head><title>Household papers</title>
      <style>
        body{font-family:Georgia,serif;padding:24px;color:#1c1917}
        h1{font-size:22px;margin:0 0 16px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th,td{border-bottom:1px solid #e7e5e4;padding:8px 6px;text-align:left}
        th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#78716c}
        @media print{button{display:none}}
      </style></head><body>
      <button onclick="window.print()">Print / Save as PDF</button>
      <h1>${householdName} — papers</h1>
      <table><thead><tr>
        <th>Title</th><th>Type</th><th>Person</th><th>Expiry</th><th>Status</th>
      </tr></thead><tbody>
      ${rows
        .map(
          (r) =>
            `<tr><td>${r[0] ?? ""}</td><td>${r[1] ?? ""}</td><td>${r[2] ?? ""}</td><td>${r[4] ?? ""}</td><td>${r[5] ?? ""}</td></tr>`,
        )
        .join("")}
      </tbody></table></body></html>`;
    const win = window.open("", "_blank");
    if (!win) {
      toast("Allow pop-ups to print PDF.", "error");
      return;
    }
    win.document.write(html);
    win.document.close();
    toast("Saved");
  }

  async function deleteAccount() {
    if (confirmEmail.trim().toLowerCase() !== props.user.email.toLowerCase()) {
      const message = "Type your email exactly to confirm.";
      setError(message);
      toast(message, "error");
      return;
    }
    setPending(true);
    setError(null);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete-account",
        confirmEmail,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      const message =
        typeof data.error === "string"
          ? data.error
          : "Could not delete account.";
      setError(message);
      toast(message, "error");
      return;
    }
    setConfirm(null);
    window.location.href = "/";
  }

  const googleOnly =
    !props.user.hasPassword && props.user.providers.includes("google");

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-ink-muted">
          Account, reminders, and preferences for this device.
        </p>
      </header>

      {error ? (
        <p
          role="alert"
          className="rounded-2xl border border-crimson/30 bg-crimson-soft px-4 py-3 text-sm text-crimson"
        >
          {error}
        </p>
      ) : null}

      <Card className="surface-3d-strong">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Account
        </p>
        <div className="mt-4 flex items-start gap-4">
          <span
            aria-hidden
            className="grid size-14 shrink-0 place-items-center rounded-2xl bg-olive-soft font-display text-xl font-semibold text-accent"
          >
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="grid gap-2 sm:flex sm:items-end sm:gap-2">
                <div className="flex-1">
                  <Input
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  className="min-h-12"
                  disabled={pending}
                  onClick={saveName}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingName(false);
                    setName(props.user.name ?? "");
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{name || "Family member"}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-9 px-3 text-sm"
                  onClick={() => setEditingName(true)}
                >
                  Edit
                </Button>
              </div>
            )}
            <p className="mt-1 break-all text-ink-muted">{props.user.email}</p>
            <div className="mt-3">
              {googleOnly ? (
                <span className="inline-flex rounded-full border border-rule bg-paper-raised px-3 py-1 text-xs font-semibold text-ink-muted">
                  Signed in with Google
                </span>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-10 px-4 text-sm"
                  onClick={() => setPasswordOpen(true)}
                >
                  Change password
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Household
        </p>
        {isOwner && editingHousehold ? (
          <div className="mt-3 grid gap-2 sm:flex sm:items-end sm:gap-2">
            <div className="flex-1">
              <Input
                label="Household name"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
              />
            </div>
            <Button type="button" disabled={pending} onClick={saveHouseholdName}>
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingHousehold(false);
                setHouseholdName(props.familyName);
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CardTitle>{householdName}</CardTitle>
            {isOwner ? (
              <Button
                type="button"
                variant="ghost"
                className="min-h-9 px-3 text-sm"
                onClick={() => setEditingHousehold(true)}
              >
                Rename
              </Button>
            ) : null}
          </div>
        )}
        <p className="mt-2 text-sm text-ink-muted">
          Your role: {roleLabel(props.role)} · {props.memberCount} member
          {props.memberCount === 1 ? "" : "s"} · {props.paperCount} paper
          {props.paperCount === 1 ? "" : "s"}
        </p>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Reminders
        </p>
        <CardTitle className="mt-2">When and how we nudge you</CardTitle>

        <div className="mt-4 grid gap-3">
          <Switch
            label="Email"
            checked={reminder.emailEnabled}
            onChange={(emailEnabled) =>
              void saveReminder({ ...reminder, emailEnabled })
            }
          />
          <Switch
            label="WhatsApp"
            hint="Coming soon"
            checked={false}
            disabled
            onChange={() => undefined}
          />
          <Switch
            label="SMS"
            hint="Coming soon"
            checked={false}
            disabled
            onChange={() => undefined}
          />
        </div>

        <p className="mt-5 text-sm font-semibold text-ink">
          Default reminder schedule
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          Each paper can override this.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {REMINDER_WINDOWS.map((window) => (
            <Chip
              key={window.days}
              selected={reminder.windows.includes(window.days)}
              onClick={() => toggleWindow(window.days)}
            >
              {window.label}
            </Chip>
          ))}
        </div>

        <div className="mt-5 grid gap-3">
          <Switch
            label="Weekly digest"
            hint={`Every ${WEEKDAYS[reminder.weeklyDigestDay] ?? "Monday"}: what's due in the next 30 days`}
            checked={reminder.weeklyDigest}
            onChange={(weeklyDigest) =>
              void saveReminder({ ...reminder, weeklyDigest })
            }
          />
          {reminder.weeklyDigest ? (
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day, index) => (
                <Chip
                  key={day}
                  selected={reminder.weeklyDigestDay === index}
                  onClick={() =>
                    void saveReminder({ ...reminder, weeklyDigestDay: index })
                  }
                >
                  {day.slice(0, 3)}
                </Chip>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold">
            Timezone
            <select
              className="min-h-12 rounded-2xl border border-rule bg-paper-raised px-3 text-sm font-medium"
              value={reminder.timezone}
              onChange={(e) =>
                void saveReminder({ ...reminder, timezone: e.target.value })
              }
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Quiet hours start
            <select
              className="min-h-12 rounded-2xl border border-rule bg-paper-raised px-3 text-sm font-medium"
              value={reminder.quietHoursStart ?? ""}
              onChange={(e) =>
                void saveReminder({
                  ...reminder,
                  quietHoursStart:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
            >
              <option value="">Off</option>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Quiet hours end
            <select
              className="min-h-12 rounded-2xl border border-rule bg-paper-raised px-3 text-sm font-medium"
              value={reminder.quietHoursEnd ?? ""}
              onChange={(e) =>
                void saveReminder({
                  ...reminder,
                  quietHoursEnd:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
            >
              <option value="">Off</option>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5">
          <Button
            type="button"
            variant="secondary"
            disabled={pending || !reminder.emailEnabled}
            onClick={sendTestReminder}
          >
            Send test reminder
          </Button>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Preferences
        </p>
        <CardTitle className="mt-2">Dates and theme</CardTitle>

        <p className="mt-4 text-sm font-semibold">Date format</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip
            selected={preferences.dateFormat === "long"}
            onClick={() =>
              void savePreferences({ ...preferences, dateFormat: "long" })
            }
          >
            19 Oct 2026
          </Chip>
          <Chip
            selected={preferences.dateFormat === "numeric"}
            onClick={() =>
              void savePreferences({ ...preferences, dateFormat: "numeric" })
            }
          >
            19/10/2026
          </Chip>
        </div>

        <p className="mt-4 text-sm font-semibold">Theme</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["light", "Light"],
              ["dark", "Dark"],
              ["system", "System"],
            ] as const
          ).map(([value, label]) => (
            <Chip
              key={value}
              selected={preferences.theme === value}
              onClick={() =>
                void savePreferences({ ...preferences, theme: value })
              }
            >
              {label}
            </Chip>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Security
        </p>
        <CardTitle className="mt-2">Active sessions</CardTitle>
        <ul className="mt-4 grid gap-3">
          <li className="flex flex-wrap items-center justify-between gap-3 border-b border-rule/70 pb-3">
            <div>
              <p className="font-medium">
                This browser
                <span className="ml-2 rounded-full border border-accent/30 bg-olive-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
                  This device
                </span>
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {props.currentDevice.label}
              </p>
              <p className="text-xs text-ink-muted">
                Last active: just now · Approximate location: unknown
              </p>
            </div>
            <SignOutButton />
          </li>
        </ul>
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setConfirm({ type: "sign-out-others" })}
          >
            Sign out of all other devices
          </Button>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Your data
        </p>
        <CardTitle className="mt-2">Export papers</CardTitle>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={exportCsv}>
            Export CSV
          </Button>
          <Button type="button" variant="secondary" onClick={exportPdf}>
            Printable PDF
          </Button>
        </div>
      </Card>

      <Card className="border border-crimson/25 bg-gradient-to-b from-[#fff7f6] to-paper-raised">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-crimson">
          Danger zone
        </p>
        <CardTitle className="mt-2">Delete my account</CardTitle>
        <p className="mt-2 text-sm text-ink-muted">
          {isSoleOwner
            ? "This deletes your login and this household (including all papers)."
            : isOwner
              ? "Transfer ownership to someone else on the Family page before deleting your account."
              : "This permanently removes your login. Papers stay with the household."}
        </p>
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            className="border-crimson/30 bg-crimson-soft text-crimson hover:border-crimson"
            disabled={isOwner && !isSoleOwner}
            onClick={() => {
              setConfirmEmail("");
              setError(null);
              setConfirm({ type: "delete-account" });
            }}
          >
            Delete my account
          </Button>
        </div>
      </Card>

      <ConfirmModal
        open={passwordOpen}
        title="Change password"
        confirmLabel="Update password"
        pending={pending}
        onClose={() => setPasswordOpen(false)}
        onConfirm={changePassword}
      >
        <div className="grid gap-3">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      </ConfirmModal>

      <ConfirmModal
        open={confirm?.type === "sign-out-others"}
        title="Sign out other devices?"
        description="Other browsers and phones signed in with your account will need to sign in again."
        confirmLabel="Sign out others"
        pending={pending}
        onClose={() => setConfirm(null)}
        onConfirm={signOutOthers}
      />

      <ConfirmModal
        open={confirm?.type === "delete-account"}
        title="Delete your account?"
        description={
          isSoleOwner
            ? `This also deletes the “${props.familyName}” household and all its papers. Type ${props.user.email} to confirm.`
            : `Type ${props.user.email} to confirm.`
        }
        confirmLabel="Delete account"
        danger
        pending={pending}
        onClose={() => {
          setConfirm(null);
          setConfirmEmail("");
        }}
        onConfirm={deleteAccount}
      >
        <Input
          label="Your email"
          type="email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder={props.user.email}
        />
      </ConfirmModal>
    </div>
  );
}
