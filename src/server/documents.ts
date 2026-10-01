import "server-only";

import type { DocumentStatus, DocumentType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { canEditDocument, canUploadDocuments } from "@/lib/roles";
import { requireFamilyMembership } from "@/server/family";

function parseOptionalDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_DATE");
  }
  return date;
}

function parseRequiredDate(value: string) {
  const date = parseOptionalDate(value);
  if (!date) throw new Error("INVALID_DATE");
  return date;
}

export type DocumentInput = {
  title: string;
  type: DocumentType;
  personId: string;
  issueDate?: string | null;
  expiryDate: string;
  notes?: string | null;
  remind30?: boolean;
  remind7?: boolean;
  remind1?: boolean;
  status?: DocumentStatus;
};

const documentInclude = {
  person: {
    select: {
      id: true,
      name: true,
      relation: true,
      avatarColor: true,
      linkedUserId: true,
    },
  },
  createdBy: { select: { id: true, name: true, email: true } },
  updatedBy: { select: { id: true, name: true, email: true } },
  renewedBy: { select: { id: true, name: true, email: true } },
  file: true,
  reminders: { orderBy: { sentAt: "desc" as const } },
} satisfies Prisma.DocumentInclude;

export async function listFamilyDocuments(userId: string) {
  const membership = await requireFamilyMembership(userId);

  return db.document.findMany({
    where: {
      familyId: membership.familyId,
      deletedAt: null,
    },
    include: documentInclude,
    orderBy: { expiryDate: "asc" },
  });
}

export async function getDocumentForUser(userId: string, documentId: string) {
  const membership = await requireFamilyMembership(userId);

  const document = await db.document.findFirst({
    where: {
      id: documentId,
      familyId: membership.familyId,
      deletedAt: null,
    },
    include: documentInclude,
  });

  if (!document) {
    throw new Error("NOT_FOUND");
  }

  return { document, membership };
}

export async function createDocument(userId: string, input: DocumentInput) {
  const membership = await requireFamilyMembership(userId);

  if (!canUploadDocuments(membership.role)) {
    throw new Error("FORBIDDEN");
  }

  const person = await db.familyProfile.findFirst({
    where: {
      familyId: membership.familyId,
      id: input.personId,
    },
  });

  if (!person) {
    throw new Error("INVALID_PERSON");
  }

  return db.document.create({
    data: {
      familyId: membership.familyId,
      personId: input.personId,
      title: input.title,
      type: input.type,
      issueDate: parseOptionalDate(input.issueDate),
      expiryDate: parseRequiredDate(input.expiryDate),
      notes: input.notes?.trim() || null,
      remind30: input.remind30 ?? true,
      remind7: input.remind7 ?? true,
      remind1: input.remind1 ?? true,
      status: input.status ?? "ACTIVE",
      createdById: userId,
      updatedById: userId,
    },
    include: documentInclude,
  });
}

export async function updateDocument(
  userId: string,
  documentId: string,
  input: Partial<DocumentInput>,
) {
  const { document, membership } = await getDocumentForUser(userId, documentId);

  if (
    !canEditDocument(membership.role, userId, {
      personId: document.person.linkedUserId ?? document.personId,
      createdById: document.createdById,
      linkedUserId: document.person.linkedUserId,
    })
  ) {
    throw new Error("FORBIDDEN");
  }

  if (input.personId) {
    const person = await db.familyProfile.findFirst({
      where: {
        familyId: membership.familyId,
        id: input.personId,
      },
    });
    if (!person) throw new Error("INVALID_PERSON");
  }

  const nextStatus =
    input.status ??
    (input.expiryDate &&
    parseRequiredDate(input.expiryDate) < new Date() &&
    document.status === "ACTIVE"
      ? "EXPIRED"
      : undefined);

  return db.document.update({
    where: { id: document.id },
    data: {
      title: input.title,
      type: input.type,
      personId: input.personId,
      issueDate:
        input.issueDate === undefined
          ? undefined
          : parseOptionalDate(input.issueDate),
      expiryDate:
        input.expiryDate === undefined
          ? undefined
          : parseRequiredDate(input.expiryDate),
      notes:
        input.notes === undefined ? undefined : input.notes?.trim() || null,
      remind30: input.remind30,
      remind7: input.remind7,
      remind1: input.remind1,
      status: nextStatus ?? input.status,
      updatedById: userId,
      renewedById: input.status === "RENEWED" ? userId : undefined,
    },
    include: documentInclude,
  });
}

export async function softDeleteDocument(userId: string, documentId: string) {
  const { document, membership } = await getDocumentForUser(userId, documentId);

  if (
    !canEditDocument(membership.role, userId, {
      personId: document.person.linkedUserId ?? document.personId,
      createdById: document.createdById,
      linkedUserId: document.person.linkedUserId,
    })
  ) {
    throw new Error("FORBIDDEN");
  }

  return db.document.update({
    where: { id: document.id },
    data: {
      deletedAt: new Date(),
      updatedById: userId,
    },
  });
}

export async function listActiveFamilyMembers(familyId: string) {
  return db.membership.findMany({
    where: { familyId, status: "ACTIVE" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function listFamilyProfilesForDocs(familyId: string) {
  return db.familyProfile.findMany({
    where: { familyId },
    select: { id: true, name: true, relation: true, avatarColor: true },
    orderBy: { createdAt: "asc" },
  });
}
