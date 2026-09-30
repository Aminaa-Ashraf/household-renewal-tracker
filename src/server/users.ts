import "server-only";

import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import type { signUpSchema } from "@/lib/validations";
import type { z } from "zod";

const SALT_ROUNDS = 12;

export async function createPasswordUser(
  input: z.infer<typeof signUpSchema>,
) {
  const existing = await db.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    throw new Error("EMAIL_TAKEN");
  }

  return db.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await hash(input.password, SALT_ROUNDS),
    },
    select: { id: true, email: true, name: true },
  });
}
