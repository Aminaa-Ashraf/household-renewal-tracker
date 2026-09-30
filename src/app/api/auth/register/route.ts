import { NextResponse } from "next/server";
import { signUpSchema } from "@/lib/validations";
import { createPasswordUser } from "@/server/users";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send JSON." }, { status: 400 });
  }

  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check the form." },
      { status: 400 },
    );
  }

  try {
    const user = await createPasswordUser(parsed.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return NextResponse.json(
        { error: "That email already has an account." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Could not create the account." },
      { status: 500 },
    );
  }
}
