import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createFamilyProfile,
  deleteFamilyProfile,
  listFamilyProfiles,
  updateFamilyProfile,
} from "@/server/profiles";
import { requireFamilyMembership } from "@/server/family";

const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  relation: z.enum(["FATHER", "MOTHER", "SON", "DAUGHTER", "SPOUSE", "OTHER"]),
  avatarColor: z.string().optional(),
  linkedUserId: z.string().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const membership = await requireFamilyMembership(session.user.id);
  const profiles = await listFamilyProfiles(membership.familyId);
  return NextResponse.json({ profiles });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the profile details." }, { status: 400 });
  }

  try {
    const profile = await createFamilyProfile(session.user.id, parsed.data);
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Viewers cannot edit profiles." }, { status: 403 });
    }
    return NextResponse.json({ error: "Could not create profile." }, { status: 500 });
  }
}
