import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateDocumentSchema } from "@/lib/validations";
import {
  getDocumentForUser,
  softDeleteDocument,
  updateDocument,
} from "@/server/documents";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { document } = await getDocumentForUser(session.user.id, id);
    return NextResponse.json({ document });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Paper not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Could not load the paper." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
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

  const parsed = updateDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check the form." },
      { status: 400 },
    );
  }

  try {
    const { id } = await params;
    const document = await updateDocument(session.user.id, id, parsed.data);
    return NextResponse.json({ document });
  } catch (error) {
    if (!(error instanceof Error)) {
      return NextResponse.json({ error: "Could not update the paper." }, { status: 500 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "You cannot edit this paper." }, { status: 403 });
    }
    if (error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Paper not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Could not update the paper." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await softDeleteDocument(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (!(error instanceof Error)) {
      return NextResponse.json({ error: "Could not delete the paper." }, { status: 500 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "You cannot delete this paper." }, { status: 403 });
    }
    if (error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Paper not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Could not delete the paper." }, { status: 500 });
  }
}
