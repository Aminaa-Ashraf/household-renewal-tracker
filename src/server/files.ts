import "server-only";

import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { put, del, get } from "@vercel/blob";
import { db } from "@/lib/db";
import { canEditDocument, canUploadDocuments } from "@/lib/roles";
import { getDocumentForUser } from "@/server/documents";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function localStorageRoot() {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "storage", "uploads");
}

function localAbsolutePath(relativeKey: string) {
  const relative = relativeKey.replace(/^storage\/uploads\//, "");
  return path.join(localStorageRoot(), relative);
}

export async function saveDocumentFile(
  userId: string,
  documentId: string,
  file: File,
) {
  const { document, membership } = await getDocumentForUser(userId, documentId);

  if (!canUploadDocuments(membership.role)) {
    throw new Error("FORBIDDEN");
  }
  if (!canEditDocument(membership.role, userId, document)) {
    throw new Error("FORBIDDEN");
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("INVALID_FILE_TYPE");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  let blobKey: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(
      `household/${membership.familyId}/${documentId}/${safeName}`,
      bytes,
      {
        access: "private",
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: true,
      },
    );
    blobKey = `blob:${blob.url}`;
  } else {
    const dir = path.join(
      localStorageRoot(),
      membership.familyId,
      documentId,
    );
    await mkdir(dir, { recursive: true });
    const fileName = `${Date.now()}-${safeName}`;
    const localPath = path.join(dir, fileName);
    await writeFile(localPath, bytes);
    blobKey = `local:storage/uploads/${membership.familyId}/${documentId}/${fileName}`;
  }

  if (document.file) {
    await deleteStoredObject(document.file.blobKey);
    await db.documentFile.delete({ where: { id: document.file.id } });
  }

  return db.documentFile.create({
    data: {
      documentId: document.id,
      blobKey,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    },
  });
}

export async function getAuthorizedFile(userId: string, fileId: string) {
  const file = await db.documentFile.findUnique({
    where: { id: fileId },
    include: {
      document: true,
    },
  });

  if (!file || file.document.deletedAt) {
    throw new Error("NOT_FOUND");
  }

  await getDocumentForUser(userId, file.documentId);
  const bytes = await readStoredObject(file.blobKey);

  return {
    bytes,
    fileName: file.fileName,
    mimeType: file.mimeType,
  };
}

async function readStoredObject(blobKey: string) {
  if (blobKey.startsWith("local:")) {
    return readFile(localAbsolutePath(blobKey.slice("local:".length)));
  }

  if (blobKey.startsWith("blob:")) {
    const url = blobKey.slice("blob:".length);
    const result = await get(url, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    if (!result || !("stream" in result) || !result.stream) {
      throw new Error("FILE_READ_FAILED");
    }
    return Buffer.from(await new Response(result.stream).arrayBuffer());
  }

  throw new Error("UNKNOWN_STORAGE");
}

async function deleteStoredObject(blobKey: string) {
  try {
    if (blobKey.startsWith("local:")) {
      await unlink(localAbsolutePath(blobKey.slice("local:".length)));
      return;
    }
    if (blobKey.startsWith("blob:") && process.env.BLOB_READ_WRITE_TOKEN) {
      await del(blobKey.slice("blob:".length), {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    }
  } catch {
    // Soft-fail cleanup so document updates still succeed.
  }
}
