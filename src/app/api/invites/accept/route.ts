import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { acceptInvite } from "@/server/invites";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send JSON." }, { status: 400 });
  }

  const token =
    typeof body === "object" && body && "token" in body
      ? String((body as { token: unknown }).token ?? "")
      : "";

  if (!token) {
    return NextResponse.json({ error: "Missing invite token." }, { status: 400 });
  }

  try {
    const membership = await acceptInvite(session.user.id, token);
    return NextResponse.json({ family: membership.family });
  } catch (error) {
    if (!(error instanceof Error)) {
      return NextResponse.json({ error: "Could not accept invite." }, { status: 500 });
    }
    const messages: Record<string, { status: number; error: string }> = {
      NOT_FOUND: { status: 404, error: "Invite not found." },
      ALREADY_ACCEPTED: { status: 409, error: "This invite was already used." },
      EXPIRED: { status: 410, error: "This invite has expired." },
      EMAIL_MISMATCH: {
        status: 403,
        error: "Sign in with the email address that received the invite.",
      },
      ALREADY_IN_FAMILY: {
        status: 409,
        error: "You already belong to a household.",
      },
    };
    const mapped = messages[error.message];
    if (mapped) return NextResponse.json({ error: mapped.error }, { status: mapped.status });
    return NextResponse.json({ error: "Could not accept invite." }, { status: 500 });
  }
}
