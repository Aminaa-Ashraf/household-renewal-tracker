import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { documentSchema } from "@/lib/validations";
import { createDocument, listFamilyDocuments } from "@/server/documents";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  try {
    const documents = await listFamilyDocuments(session.user.id);
    return NextResponse.json({ documents });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_FAMILY") {
      return NextResponse.json({ error: "Create a household first." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not load documents." }, { status: 500 });
  }
}

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

  const parsed = documentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check the form." },
      { status: 400 },
    );
  }

  try {
    const document = await createDocument(session.user.id, parsed.data);
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    if (!(error instanceof Error)) {
      return NextResponse.json({ error: "Could not save the paper." }, { status: 500 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Viewers cannot upload papers." }, { status: 403 });
    }
    if (error.message === "NO_FAMILY") {
      return NextResponse.json({ error: "Create a household first." }, { status: 400 });
    }
    if (error.message === "INVALID_PERSON") {
      return NextResponse.json({ error: "Choose a family member." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not save the paper." }, { status: 500 });
  }
}
