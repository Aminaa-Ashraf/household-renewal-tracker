import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(8, "Use at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Enter your password"),
});

export const magicLinkSchema = z.object({
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
});

export const createFamilySchema = z.object({
  name: z.string().trim().min(2, "Household name is too short").max(80),
});

export const inviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  role: z.enum(["MEMBER", "VIEWER"]),
});

export const documentSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(120),
  type: z.enum([
    "CNIC",
    "PASSPORT",
    "DRIVING_LICENSE",
    "VEHICLE_PAPERS",
    "INSURANCE",
    "ACADEMIC_DEADLINE",
    "OTHER",
  ]),
  personId: z.string().min(1, "Choose whose paper this is"),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().min(1, "Expiry date is required"),
  notes: z.string().trim().max(2000).optional().nullable(),
  remind30: z.boolean().default(true),
  remind7: z.boolean().default(true),
  remind1: z.boolean().default(true),
  status: z.enum(["ACTIVE", "RENEWED", "EXPIRED", "ARCHIVED"]).optional(),
});

export const updateDocumentSchema = documentSchema.partial().extend({
  title: z.string().trim().min(2).max(120).optional(),
  type: documentSchema.shape.type.optional(),
  personId: z.string().min(1).optional(),
  expiryDate: z.string().min(1).optional(),
});
