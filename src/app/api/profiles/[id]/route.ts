import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { deleteFamilyProfile, updateFamilyProfile } from "@/server/profiles";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  relation: z
    .enum(["FATHER", "MOTHER", "SON", "DAUGHTER", "SPOUSE", "OTHER"])
    .optional(),
  avatarColor: z.string().optional(),
  linkedUserId: z.string().nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the profile details." }, { status: 400 });
  }

  try {
    const profile = await updateFamilyProfile(session.user.id, id, parsed.data);
    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const { id } = await params;

  try {
    await deleteFamilyProfile(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "HAS_PAPERS") {
      return NextResponse.json(
        { error: "Move or remove this person's papers first." },
        { status: 409 },
      );
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }
    return NextResponse.json({ error: "Could not delete profile." }, { status: 500 });
  }
}
