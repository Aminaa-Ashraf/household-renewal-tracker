import type { DocumentType as PrismaDocumentType, Role } from "@prisma/client";

export const DOCUMENT_TYPE_OPTIONS = [
  { value: "CNIC", label: "CNIC" },
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVING_LICENSE", label: "Driving License" },
  { value: "VEHICLE_PAPERS", label: "Vehicle Papers" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "ACADEMIC_DEADLINE", label: "Academic Deadline" },
  { value: "OTHER", label: "Other" },
] as const;

export type DocumentTypeValue =
  (typeof DOCUMENT_TYPE_OPTIONS)[number]["value"];

export function documentTypeLabel(type: PrismaDocumentType | string): string {
  return (
    DOCUMENT_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
    type
  );
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "OWNER":
      return "Owner";
    case "MEMBER":
      return "Member";
    case "VIEWER":
      return "Viewer";
  }
}

export function canManageFamily(role: Role) {
  return role === "OWNER";
}

export function canUploadDocuments(role: Role) {
  return role === "OWNER" || role === "MEMBER";
}

export function canEditDocument(
  role: Role,
  userId: string,
  document: {
    personId: string;
    createdById: string;
    linkedUserId?: string | null;
  },
) {
  if (role === "OWNER") return true;
  if (role === "VIEWER") return false;
  return (
    document.linkedUserId === userId ||
    document.personId === userId ||
    document.createdById === userId
  );
}

export const FAMILY_RELATION_OPTIONS = [
  { value: "FATHER", label: "Father" },
  { value: "MOTHER", label: "Mother" },
  { value: "SON", label: "Son" },
  { value: "DAUGHTER", label: "Daughter" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "OTHER", label: "Other" },
] as const;

export function relationLabel(relation: string) {
  return (
    FAMILY_RELATION_OPTIONS.find((item) => item.value === relation)?.label ??
    relation
  );
}
