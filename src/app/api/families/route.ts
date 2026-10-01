import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createFamilySchema } from "@/lib/validations";
import { createFamily } from "@/server/family";

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
