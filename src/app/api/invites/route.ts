import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { inviteSchema } from "@/lib/validations";
import { cancelInvite, createInvite } from "@/server/invites";

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

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check the form." },
      { status: 400 },
    );
  }

  try {
    const invite = await createInvite(session.user.id, parsed.data);
    return NextResponse.json(
      {
        invite: {
          id: invite.id,
          email: invite.email,
          role: invite.role,
          token: invite.token,
          acceptUrl: invite.acceptUrl,
          createdAt: invite.createdAt,
          expiresAt: invite.expiresAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (!(error instanceof Error)) {
      return NextResponse.json({ error: "Could not send invite." }, { status: 500 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Only owners can invite." }, { status: 403 });
    }
    if (error.message === "ALREADY_IN_FAMILY") {
      return NextResponse.json(
        { error: "That person already belongs to a household." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Could not send invite." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const inviteId = new URL(request.url).searchParams.get("id");
  if (!inviteId) {
    return NextResponse.json({ error: "Missing invite id." }, { status: 400 });
  }

  try {
    await cancelInvite(session.user.id, inviteId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Only owners can cancel invites." }, { status: 403 });
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Invite not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Could not cancel invite." }, { status: 500 });
  }
}
