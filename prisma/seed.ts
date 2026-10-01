import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { addDays } from "../src/lib/dates";

const db = new PrismaClient();

async function upsertUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const passwordHash = await hash(input.password, 12);
  return db.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      passwordHash,
    },
    create: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
  });
}

async function main() {
  const owner = await upsertUser({
    name: "Papa Khan",
    email: "papa@khan.demo",
    password: "demo-pass-123",
  });
  const ammi = await upsertUser({
    name: "Ammi Khan",
    email: "ammi@khan.demo",
    password: "demo-pass-123",
  });
  const hassan = await upsertUser({
    name: "Hassan Khan",
    email: "hassan@khan.demo",
    password: "demo-pass-123",
  });

  let family = await db.family.findFirst({
    where: { name: "Khan Household" },
  });

  if (!family) {
    family = await db.family.create({
      data: { name: "Khan Household" },
    });
  }

  for (const [user, role] of [
    [owner, "OWNER"],
    [ammi, "MEMBER"],
    [hassan, "VIEWER"],
  ] as const) {
    await db.membership.upsert({
      where: {
        userId_familyId: {
          userId: user.id,
          familyId: family.id,
        },
      },
      update: { role, status: "ACTIVE" },
      create: {
        userId: user.id,
        familyId: family.id,
        role,
        status: "ACTIVE",
      },
    });
  }

  await db.document.deleteMany({ where: { familyId: family.id } });

  const papers = [
    {
      title: "Papa's passport",
      type: "PASSPORT" as const,
      personId: owner.id,
      expiryDate: addDays(new Date(), 18),
    },
    {
      title: "Ammi's CNIC",
      type: "CNIC" as const,
      personId: ammi.id,
      expiryDate: addDays(new Date(), 6),
    },
    {
      title: "Family car insurance",
      type: "INSURANCE" as const,
      personId: owner.id,
      expiryDate: addDays(new Date(), -4),
      status: "EXPIRED" as const,
    },
    {
      title: "Hassan's driving license",
      type: "DRIVING_LICENSE" as const,
      personId: hassan.id,
      expiryDate: addDays(new Date(), 86),
    },
  ];

  for (const paper of papers) {
    await db.document.create({
      data: {
        familyId: family.id,
        personId: paper.personId,
        title: paper.title,
        type: paper.type,
        expiryDate: paper.expiryDate,
        status: paper.status ?? "ACTIVE",
        createdById: owner.id,
        updatedById: owner.id,
        remind30: true,
        remind7: true,
        remind1: true,
      },
    });
  }

  console.log("Seeded Khan Household");
  console.log("Login: papa@khan.demo / demo-pass-123");
  console.log("Also: ammi@khan.demo, hassan@khan.demo (same password)");
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
