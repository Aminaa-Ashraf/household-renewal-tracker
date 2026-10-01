import "server-only";

import { Resend } from "resend";
import type { Role } from "@prisma/client";

const fromAddress =
  process.env.EMAIL_FROM ??
  "Household Renewal Tracker <onboarding@resend.dev>";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

async function deliver(to: string, subject: string, html: string, text: string) {
  const resend = getResend();
  if (!resend) {
    console.log(`[email:dev] to=${to} subject=${subject}\n${text}`);
    return { id: "dev-log" };
  }

  const result = await resend.emails.send({
    from: fromAddress,
    to,
    subject,
    html,
    text,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function sendInviteEmail(input: {
  to: string;
  familyName: string;
  invitedByName: string;
  acceptUrl: string;
  role: Role;
}) {
  const subject = `Join ${input.familyName} on Household Renewal Tracker`;
  const text = `${input.invitedByName} invited you to ${input.familyName} as ${input.role.toLowerCase()}.

Open this link to accept:
${input.acceptUrl}

This invite expires in 7 days.`;

  const html = `
    <p><strong>${input.invitedByName}</strong> invited you to <strong>${input.familyName}</strong> as ${input.role.toLowerCase()}.</p>
    <p><a href="${input.acceptUrl}">Accept invite</a></p>
    <p>This invite expires in 7 days.</p>
  `;

  return deliver(input.to, subject, html, text);
}

export async function sendReminderEmail(input: {
  to: string;
  documentTitle: string;
  personName: string;
  relative: string;
  absoluteDate: string;
  windowLabel: string;
  documentUrl: string;
}) {
  const subject = `${input.documentTitle} ${input.relative}`;
  const text = `${input.documentTitle} (${input.personName}) ${input.relative} (${input.absoluteDate}).

Reminder window: ${input.windowLabel}
Open the paper: ${input.documentUrl}`;

  const html = `
    <p><strong>${input.documentTitle}</strong> (${input.personName}) ${input.relative}.</p>
    <p>Date: ${input.absoluteDate}<br/>Window: ${input.windowLabel}</p>
    <p><a href="${input.documentUrl}">Open the paper</a></p>
  `;

  return deliver(input.to, subject, html, text);
}
