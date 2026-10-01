import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createFamilySchema } from "@/lib/validations";
import {
  changeMemberRole,
  createFamily,
  deleteHousehold,
  removeMember,
  renameFamily,
  transferOwnership,
} from "@/server/family";

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

  const parsed = createFamilySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check the form." },
      { status: 400 },
    );
  }

  try {
    const family = await createFamily(session.user.id, parsed.data.name);
    return NextResponse.json({ family }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_IN_FAMILY") {
      return NextResponse.json(
        { error: "You already belong to a household." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Could not create the household." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = z
    .object({
      action: z.enum(["rename", "role", "remove", "transfer"]),
      name: z.string().optional(),
      userId: z.string().optional(),
      role: z.enum(["OWNER", "MEMBER", "VIEWER"]).optional(),
    })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const { action } = parsed.data;
    if (action === "rename") {
      const family = await renameFamily(session.user.id, parsed.data.name ?? "");
      return NextResponse.json({ family });
    }
    if (action === "role" && parsed.data.userId && parsed.data.role) {
      await changeMemberRole(
        session.user.id,
        parsed.data.userId,
        parsed.data.role,
      );
      return NextResponse.json({ ok: true });
    }
    if (action === "remove" && parsed.data.userId) {
      await removeMember(session.user.id, parsed.data.userId);
      return NextResponse.json({ ok: true });
    }
    if (action === "transfer" && parsed.data.userId) {
      await transferOwnership(session.user.id, parsed.data.userId);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Could not update household." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const confirmName =
    typeof body?.confirmName === "string" ? body.confirmName : "";

  try {
    await deleteHousehold(session.user.id, confirmName);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "NAME_MISMATCH") {
      return NextResponse.json(
        { error: "Type the household name exactly to confirm." },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Only the owner can delete." },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: "Could not delete household." },
      { status: 500 },
    );
  }
}
