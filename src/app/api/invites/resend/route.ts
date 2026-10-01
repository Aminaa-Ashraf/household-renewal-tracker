import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resendInvite } from "@/server/invites";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const inviteId = typeof body?.inviteId === "string" ? body.inviteId : "";
  if (!inviteId) {
    return NextResponse.json({ error: "Missing invite." }, { status: 400 });
  }

  try {
    const invite = await resendInvite(session.user.id, inviteId);
    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        token: invite.token,
        acceptUrl: invite.acceptUrl,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Only owners can resend." }, { status: 403 });
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Invite not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Could not resend invite." }, { status: 500 });
  }
}
