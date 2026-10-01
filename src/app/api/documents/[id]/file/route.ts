import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveDocumentFile } from "@/server/files";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image or PDF." }, { status: 400 });
    }

    const saved = await saveDocumentFile(session.user.id, id, file);
    return NextResponse.json({ file: saved }, { status: 201 });
  } catch (error) {
    if (!(error instanceof Error)) {
      return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }
    if (error.message === "INVALID_FILE_TYPE") {
      return NextResponse.json(
        { error: "Only JPG, PNG, WebP, or PDF files are allowed." },
        { status: 400 },
      );
    }
    if (error.message === "FILE_TOO_LARGE") {
      return NextResponse.json({ error: "File must be 8MB or smaller." }, { status: 400 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "You cannot upload to this paper." }, { status: 403 });
    }
    if (error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Paper not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
