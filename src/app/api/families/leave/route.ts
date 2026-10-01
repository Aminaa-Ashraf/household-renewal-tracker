import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { leaveFamily } from "@/server/family";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  try {
    await leaveFamily(session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "OWNER_CANNOT_LEAVE") {
      return NextResponse.json(
        {
          error:
            "Transfer ownership or remove other members before leaving as the only owner.",
        },
        { status: 409 },
      );
    }
    if (error instanceof Error && error.message === "NO_FAMILY") {
      return NextResponse.json({ error: "You are not in a household." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not leave the household." }, { status: 500 });
  }
}
