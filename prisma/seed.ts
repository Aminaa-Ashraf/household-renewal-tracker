import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const familyCount = await db.family.count();
  console.log(
    `Database is ready. Families: ${familyCount}. Demo seed runs in a later chapter.`,
  );
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
