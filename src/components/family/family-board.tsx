"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { FamilyRelation, Role } from "@prisma/client";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { daysUntil, formatLongDate } from "@/lib/dates";
import {
  FAMILY_RELATION_OPTIONS,
  canManageFamily,
  canUploadDocuments,
  documentTypeLabel,
  relationLabel,
  roleLabel,
} from "@/lib/roles";
import { cn } from "@/lib/utils";

type ProfileDoc = {
  id: string;
  title: string;
  type: string;
  expiryDate: string;
};

type Profile = {
  id: string;
  name: string;
  relation: FamilyRelation;
  avatarColor: string;
  linkedUserId: string | null;
  documents: ProfileDoc[];
};

type Member = {
  id: string;
  role: Role;
  user: { id: string; name: string | null; email: string };
};

type Invite = {
  id: string;
  email: string;
  role: Role;
  token: string;
  createdAt: string;
  expiresAt: string;
};

export function FamilyBoard({
  familyName,
  currentUserId,
  role,
  profiles: initialProfiles,
  members: initialMembers,
  invites: initialInvites,
}: {
  familyName: string;
  currentUserId: string;
  role: Role;
  profiles: Profile[];
  members: Member[];
  invites: Invite[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const canEdit = canUploadDocuments(role);
  const isOwner = canManageFamily(role);

  const [profiles, setProfiles] = useState(initialProfiles);
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [error, setError] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState<{
    id?: string;
    name: string;
    relation: FamilyRelation;
  } | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"MEMBER" | "VIEWER">("MEMBER");
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [memberMenu, setMemberMenu] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [confirm, setConfirm] = useState<
    | { type: "delete-profile"; id: string; name: string }
    | { type: "remove-member"; userId: string; name: string }
    | { type: "transfer"; userId: string; name: string }
    | { type: "leave" }
    | { type: "delete-household" }
    | { type: "revoke-invite"; id: string }
    | null
  >(null);
  const [confirmText, setConfirmText] = useState("");
  const [roleTarget, setRoleTarget] = useState<{
    userId: string;
    name: string;
    role: Role;
  } | null>(null);

  function inviteAbsoluteUrl(token: string) {
    if (typeof window === "undefined") return `/invites/${token}`;
    return `${window.location.origin}/invites/${token}`;
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    toast("Copied");
  }

  function shareWhatsApp(url: string) {
    const message = encodeURIComponent(
      `Join our household on Household Renewal Tracker: ${url}`,
    );
    window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
  }

  async function api(
    url: string,
    init?: RequestInit,
  ): Promise<{ ok: boolean; data: Record<string, unknown>; error?: string }> {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return {
      ok: res.ok,
      data,
      error: typeof data.error === "string" ? data.error : undefined,
    };
  }

  async function saveProfile() {
    if (!profileForm) return;
    setPending(true);
    setError(null);
    const body = {
      name: profileForm.name.trim(),
      relation: profileForm.relation,
    };
    const isEdit = Boolean(profileForm.id);
    const result = await api(
      isEdit ? `/api/profiles/${profileForm.id}` : "/api/profiles",
      {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(body),
      },
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save profile.");
      return;
    }
    const saved = result.data.profile as Profile;
    setProfiles((prev) => {
      if (isEdit) {
        return prev.map((p) =>
          p.id === saved.id
            ? { ...p, name: saved.name, relation: saved.relation, avatarColor: saved.avatarColor }
            : p,
        );
      }
      return [
        ...prev,
        {
          ...saved,
          documents: [],
          linkedUserId: saved.linkedUserId ?? null,
        },
      ];
    });
    setProfileForm(null);
    toast("Saved");
    router.refresh();
  }

  async function deleteProfile(id: string) {
    setPending(true);
    setError(null);
    const result = await api(`/api/profiles/${id}`, { method: "DELETE" });
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not delete profile.");
      setConfirm(null);
      return;
    }
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setConfirm(null);
    toast("Saved");
    router.refresh();
  }

  async function sendInvite() {
    setPending(true);
    setError(null);
    const result = await api("/api/invites", {
      method: "POST",
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not send invite.");
      return;
    }
    const invite = result.data.invite as Invite & { acceptUrl?: string };
    setInvites((prev) => [invite, ...prev]);
    const url = invite.acceptUrl ?? inviteAbsoluteUrl(invite.token);
    setLastInviteUrl(url);
    setInviteEmail("");
    toast("Saved");
    router.refresh();
  }

  async function resendInvite(id: string) {
    setPending(true);
    const result = await api("/api/invites/resend", {
      method: "POST",
      body: JSON.stringify({ inviteId: id }),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not resend.");
      toast(result.error ?? "Could not resend.", "error");
      return;
    }
    const invite = result.data.invite as Invite & { acceptUrl?: string };
    setInvites((prev) => prev.map((i) => (i.id === id ? invite : i)));
    setLastInviteUrl(invite.acceptUrl ?? inviteAbsoluteUrl(invite.token));
    toast("Saved");
  }

  async function revokeInvite(id: string) {
    setPending(true);
    const result = await api(`/api/invites?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not revoke.");
      return;
    }
    setInvites((prev) => prev.filter((i) => i.id !== id));
    setConfirm(null);
    toast("Saved");
  }

  async function changeRole(userId: string, nextRole: Role) {
    setPending(true);
    const result = await api("/api/families", {
      method: "PATCH",
      body: JSON.stringify({ action: "role", userId, role: nextRole }),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not change role.");
      return;
    }
    setMembers((prev) =>
      prev.map((m) => (m.user.id === userId ? { ...m, role: nextRole } : m)),
    );
    setRoleTarget(null);
    toast("Saved");
    router.refresh();
  }

  async function removeMember(userId: string) {
    setPending(true);
    const result = await api("/api/families", {
      method: "PATCH",
      body: JSON.stringify({ action: "remove", userId }),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not remove member.");
      return;
    }
    setMembers((prev) => prev.filter((m) => m.user.id !== userId));
    setConfirm(null);
    toast("Saved");
    router.refresh();
  }

  async function transferOwnership(userId: string) {
    setPending(true);
    const result = await api("/api/families", {
      method: "PATCH",
      body: JSON.stringify({ action: "transfer", userId }),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not transfer ownership.");
      return;
    }
    setConfirm(null);
    toast("Saved");
    router.refresh();
  }

  async function leaveHousehold() {
    setPending(true);
    const result = await api("/api/families/leave", { method: "POST" });
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not leave.");
      setConfirm(null);
      return;
    }
    window.location.href = "/onboarding";
  }

  async function deleteHousehold() {
    if (confirmText.trim() !== familyName.trim()) {
      setError("Type the household name exactly to confirm.");
      return;
    }
    setPending(true);
    const result = await api("/api/families", {
      method: "DELETE",
      body: JSON.stringify({ confirmName: confirmText }),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not delete household.");
      return;
    }
    window.location.href = "/onboarding";
  }

  const sortedProfiles = useMemo(
    () =>
      [...profiles].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    [profiles],
  );

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {familyName}
        </h1>
        <p className="mt-2 text-ink-muted">
          People without logins, members with accounts, and invites.
        </p>
      </header>

      {error ? (
        <p role="alert" className="rounded-2xl border border-crimson/30 bg-crimson-soft px-4 py-3 text-sm text-crimson">
          {error}
        </p>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              People
            </p>
            <CardTitle className="mt-2">Family profiles</CardTitle>
          </div>
          {canEdit ? (
            <Button
              type="button"
              variant="secondary"
              className="min-h-10 px-4 text-sm"
              onClick={() =>
                setProfileForm({ name: "", relation: "OTHER" })
              }
            >
              Add person
            </Button>
          ) : null}
        </div>

        <ul className="mt-4 grid gap-3">
          {sortedProfiles.map((profile) => (
            <li
              key={profile.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-rule/70 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-2xl text-sm font-semibold text-white"
                  style={{ backgroundColor: profile.avatarColor }}
                >
                  {profile.name.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    {profileSummary(profile)}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {relationLabel(profile.relation)}
                    {profile.linkedUserId ? " · Linked to a member" : ""}
                  </p>
                </div>
              </div>
              {canEdit ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-9 px-3 text-sm"
                    onClick={() =>
                      setProfileForm({
                        id: profile.id,
                        name: profile.name,
                        relation: profile.relation,
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-9 px-3 text-sm text-crimson"
                    onClick={() =>
                      setConfirm({
                        type: "delete-profile",
                        id: profile.id,
                        name: profile.name,
                      })
                    }
                  >
                    Delete
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
          {sortedProfiles.length === 0 ? (
            <li className="text-sm text-ink-muted">No profiles yet.</li>
          ) : null}
        </ul>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Members
        </p>
        <CardTitle className="mt-2">People with logins</CardTitle>
        <ul className="mt-4 grid gap-3">
          {members.map((member) => {
            const name = member.user.name ?? member.user.email;
            const initial = name.trim().charAt(0).toUpperCase() || "M";
            const isYou = member.user.id === currentUserId;
            return (
              <li
                key={member.id}
                className="relative flex flex-wrap items-center justify-between gap-3 border-b border-rule/70 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-olive-soft font-semibold text-accent">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">
                      {name}
                      {isYou ? (
                        <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-accent">
                          You
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-sm text-ink-muted">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-rule bg-paper-raised px-2.5 py-1 text-xs font-semibold text-ink-muted">
                    {roleLabel(member.role)}
                  </span>
                  {isOwner && !isYou ? (
                    <div className="relative">
                      <button
                        type="button"
                        aria-label={`Actions for ${name}`}
                        className="grid size-9 place-items-center rounded-xl border border-rule text-ink-muted hover:bg-ink/5"
                        onClick={() =>
                          setMemberMenu((cur) =>
                            cur === member.user.id ? null : member.user.id,
                          )
                        }
                      >
                        ⋯
                      </button>
                      {memberMenu === member.user.id ? (
                        <div className="absolute right-0 z-20 mt-1 w-52 rounded-2xl border border-rule bg-paper-raised p-1 shadow-[var(--shadow-lift)]">
                          <MenuButton
                            onClick={() => {
                              setMemberMenu(null);
                              setRoleTarget({
                                userId: member.user.id,
                                name,
                                role: member.role,
                              });
                            }}
                          >
                            Change role
                          </MenuButton>
                          <MenuButton
                            onClick={() => {
                              setMemberMenu(null);
                              setConfirm({
                                type: "remove-member",
                                userId: member.user.id,
                                name,
                              });
                            }}
                          >
                            Remove from household
                          </MenuButton>
                          <MenuButton
                            onClick={() => {
                              setMemberMenu(null);
                              setConfirm({
                                type: "transfer",
                                userId: member.user.id,
                                name,
                              });
                            }}
                          >
                            Transfer ownership
                          </MenuButton>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {isOwner ? (
        <>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Invite
            </p>
            <CardTitle className="mt-2">Invite someone</CardTitle>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <Input
                label="Email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="cousin@email.com"
              />
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-ink">Role</label>
                <select
                  className="min-h-12 rounded-2xl border border-rule bg-paper-raised px-3 text-sm font-semibold"
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "MEMBER" | "VIEWER")
                  }
                >
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  disabled={pending || !inviteEmail.trim()}
                  onClick={sendInvite}
                >
                  Send invite
                </Button>
              </div>
            </div>
            {lastInviteUrl ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-10 px-4 text-sm"
                  onClick={() => copyText(lastInviteUrl)}
                >
                  Copy invite link
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-10 px-4 text-sm"
                  onClick={() => shareWhatsApp(lastInviteUrl)}
                >
                  Share on WhatsApp
                </Button>
              </div>
            ) : null}
            <p className="mt-3 text-xs text-ink-muted">
              Invite links expire after 7 days.
            </p>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Pending invites
            </p>
            <CardTitle className="mt-2">Waiting to join</CardTitle>
            {invites.length === 0 ? (
              <p className="mt-4 text-sm text-ink-muted">
                No pending invites right now.
              </p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {invites.map((invite) => {
                  const url = inviteAbsoluteUrl(invite.token);
                  return (
                    <li
                      key={invite.id}
                      className="grid gap-2 border-b border-rule/70 pb-3 last:border-0 last:pb-0 sm:flex sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-sm text-ink-muted">
                          {roleLabel(invite.role)} · sent{" "}
                          {formatLongDate(new Date(invite.createdAt))} · expires{" "}
                          {formatLongDate(new Date(invite.expiresAt))}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="min-h-9 px-3 text-sm"
                          onClick={() => resendInvite(invite.id)}
                        >
                          Resend
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="min-h-9 px-3 text-sm"
                          onClick={() => copyText(url)}
                        >
                          Copy link
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="min-h-9 px-3 text-sm text-crimson"
                          onClick={() =>
                            setConfirm({ type: "revoke-invite", id: invite.id })
                          }
                        >
                          Revoke
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      ) : null}

      <Card className="border border-crimson/25 bg-gradient-to-b from-[#fff7f6] to-paper-raised">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-crimson">
          Danger zone
        </p>
        {isOwner ? (
          <>
            <CardTitle className="mt-2">Household actions</CardTitle>
            <p className="mt-2 text-sm text-ink-muted">
              Transfer ownership before leaving. Deleting the household removes
              everyone&apos;s access and all papers in it.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" disabled>
                Leave household
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="border-crimson/30 bg-crimson-soft text-crimson hover:border-crimson"
                onClick={() => {
                  setConfirmText("");
                  setConfirm({ type: "delete-household" });
                }}
              >
                Delete household
              </Button>
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              Transfer ownership before leaving
            </p>
          </>
        ) : (
          <>
            <CardTitle className="mt-2">Leave household</CardTitle>
            <p className="mt-2 text-sm text-ink-muted">
              You keep your login. Papers stay with the household.
            </p>
            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                className="border-crimson/30 bg-crimson-soft text-crimson hover:border-crimson"
                onClick={() => setConfirm({ type: "leave" })}
              >
                Leave household
              </Button>
            </div>
          </>
        )}
      </Card>

      {profileForm ? (
        <ConfirmModal
          open
          title={profileForm.id ? "Edit person" : "Add person"}
          confirmLabel="Save"
          pending={pending}
          onClose={() => setProfileForm(null)}
          onConfirm={saveProfile}
        >
          <div className="grid gap-3">
            <Input
              label="Name"
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, name: e.target.value })
              }
              placeholder="Papa"
            />
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-ink">Relation</label>
              <select
                className="min-h-12 rounded-2xl border border-rule bg-paper-raised px-3 text-sm font-semibold"
                value={profileForm.relation}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    relation: e.target.value as FamilyRelation,
                  })
                }
              >
                {FAMILY_RELATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ConfirmModal>
      ) : null}

      {roleTarget ? (
        <ConfirmModal
          open
          title={`Change role for ${roleTarget.name}`}
          confirmLabel="Save role"
          pending={pending}
          onClose={() => setRoleTarget(null)}
          onConfirm={() => changeRole(roleTarget.userId, roleTarget.role)}
        >
          <div className="flex flex-wrap gap-2">
            {(["MEMBER", "VIEWER"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleTarget({ ...roleTarget, role: r })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-semibold",
                  roleTarget.role === r
                    ? "border-accent bg-olive-soft text-accent"
                    : "border-rule text-ink-muted",
                )}
              >
                {roleLabel(r)}
              </button>
            ))}
          </div>
        </ConfirmModal>
      ) : null}

      <ConfirmModal
        open={confirm?.type === "delete-profile"}
        title="Delete this person?"
        description={
          confirm?.type === "delete-profile"
            ? `Remove ${confirm.name} from the household profiles. Move their papers first if they still have any.`
            : undefined
        }
        confirmLabel="Delete"
        danger
        pending={pending}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === "delete-profile") deleteProfile(confirm.id);
        }}
      />

      <ConfirmModal
        open={confirm?.type === "remove-member"}
        title="Remove from household?"
        description={
          confirm?.type === "remove-member"
            ? `${confirm.name} will lose access to this vault.`
            : undefined
        }
        confirmLabel="Remove"
        danger
        pending={pending}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === "remove-member") removeMember(confirm.userId);
        }}
      />

      <ConfirmModal
        open={confirm?.type === "transfer"}
        title="Transfer ownership?"
        description={
          confirm?.type === "transfer"
            ? `${confirm.name} will become the owner. You will become a member.`
            : undefined
        }
        confirmLabel="Transfer"
        danger
        pending={pending}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === "transfer") transferOwnership(confirm.userId);
        }}
      />

      <ConfirmModal
        open={confirm?.type === "leave"}
        title="Leave this household?"
        description="You will lose access to shared papers. Your login stays."
        confirmLabel="Leave"
        danger
        pending={pending}
        onClose={() => setConfirm(null)}
        onConfirm={leaveHousehold}
      />

      <ConfirmModal
        open={confirm?.type === "revoke-invite"}
        title="Revoke invite?"
        description="The invite link will stop working."
        confirmLabel="Revoke"
        danger
        pending={pending}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === "revoke-invite") revokeInvite(confirm.id);
        }}
      />

      <ConfirmModal
        open={confirm?.type === "delete-household"}
        title="Delete this household?"
        description={`Type “${familyName}” to permanently delete the household and all its papers.`}
        confirmLabel="Delete household"
        danger
        pending={pending}
        onClose={() => {
          setConfirm(null);
          setConfirmText("");
        }}
        onConfirm={deleteHousehold}
      >
        <Input
          label="Household name"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={familyName}
        />
      </ConfirmModal>
    </div>
  );
}

function profileSummary(profile: Profile) {
  const count = profile.documents.length;
  const paperWord = count === 1 ? "paper" : "papers";
  const next = profile.documents[0];
  if (!next) return `${profile.name} · 0 papers`;
  const days = daysUntil(new Date(next.expiryDate));
  const due =
    days === 0
      ? "due today"
      : days === 1
        ? "due in 1 day"
        : days > 1
          ? `due in ${days} days`
          : `expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  return `${profile.name} · ${count} ${paperWord} · ${documentTypeLabel(next.type)} ${due}`;
}

function MenuButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink hover:bg-ink/5"
    >
      {children}
    </button>
  );
}
