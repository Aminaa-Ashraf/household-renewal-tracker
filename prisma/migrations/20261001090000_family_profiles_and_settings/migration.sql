-- AlterEnum
ALTER TYPE "ReminderWindow" ADD VALUE 'DAYS_90';
ALTER TYPE "ReminderWindow" ADD VALUE 'DAYS_60';
ALTER TYPE "ReminderWindow" ADD VALUE 'DAYS_14';

-- CreateEnum
CREATE TYPE "FamilyRelation" AS ENUM ('FATHER', 'MOTHER', 'SON', 'DAUGHTER', 'SPOUSE', 'OTHER');

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "sessionsInvalidBefore" TIMESTAMP(3);

-- CreateTable FamilyProfile
CREATE TABLE "FamilyProfile" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" "FamilyRelation" NOT NULL DEFAULT 'OTHER',
    "avatarColor" TEXT NOT NULL DEFAULT '#1F5E4A',
    "linkedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyProfile_pkey" PRIMARY KEY ("id")
);

INSERT INTO "FamilyProfile" ("id", "familyId", "name", "relation", "avatarColor", "linkedUserId", "createdAt", "updatedAt")
SELECT
  md5(m."familyId" || ':' || m."userId"),
  m."familyId",
  COALESCE(NULLIF(u."name", ''), split_part(u."email", '@', 1)),
  'OTHER'::"FamilyRelation",
  '#1F5E4A',
  m."userId",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Membership" m
JOIN "User" u ON u."id" = m."userId"
WHERE m."status" = 'ACTIVE';

ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_personId_fkey";

UPDATE "Document" d
SET "personId" = p."id"
FROM "FamilyProfile" p
WHERE p."linkedUserId" = d."personId"
  AND p."familyId" = d."familyId";

UPDATE "Document" d
SET "personId" = sub."id"
FROM (
  SELECT DISTINCT ON ("familyId") "id", "familyId"
  FROM "FamilyProfile"
  ORDER BY "familyId", "createdAt"
) AS sub
WHERE d."familyId" = sub."familyId"
  AND NOT EXISTS (SELECT 1 FROM "FamilyProfile" p WHERE p."id" = d."personId");

CREATE INDEX "FamilyProfile_familyId_idx" ON "FamilyProfile"("familyId");
CREATE INDEX "FamilyProfile_linkedUserId_idx" ON "FamilyProfile"("linkedUserId");

ALTER TABLE "FamilyProfile" ADD CONSTRAINT "FamilyProfile_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FamilyProfile" ADD CONSTRAINT "FamilyProfile_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Document" ADD CONSTRAINT "Document_personId_fkey" FOREIGN KEY ("personId") REFERENCES "FamilyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Invite" ADD COLUMN "revokedAt" TIMESTAMP(3);

CREATE TABLE "ReminderPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "windows" INTEGER[] DEFAULT ARRAY[30, 7, 1, 0],
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT false,
    "weeklyDigestDay" INTEGER NOT NULL DEFAULT 1,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Karachi',
    "quietHoursStart" INTEGER,
    "quietHoursEnd" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReminderPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReminderPreference_userId_key" ON "ReminderPreference"("userId");
ALTER TABLE "ReminderPreference" ADD CONSTRAINT "ReminderPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "dateFormat" TEXT NOT NULL DEFAULT 'long',
    "theme" TEXT NOT NULL DEFAULT 'system',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
