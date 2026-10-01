import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getActiveMembership, getFamilyWithMembers } from "@/server/family";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const membership = await getActiveMembership(session.user.id);
  if (!membership) {
    return NextResponse.json({ family: null }, { status: 200 });
  }

  const family = await getFamilyWithMembers(membership.familyId);
  return NextResponse.json({
    family,
    role: membership.role,
  });
}
