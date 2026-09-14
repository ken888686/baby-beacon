-- Baseline migration for the current Baby Beacon schema.
-- Existing databases should mark this migration as applied before running
-- the ActivityLog backfill migration.

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "BabyRole" AS ENUM ('OWNER', 'ADMIN', 'VIEWER');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');
CREATE TYPE "HealthType" AS ENUM ('TEMPERATURE', 'SYMPTOM', 'MEDICINE', 'VACCINE', 'OTHER');
CREATE TYPE "FeedType" AS ENUM ('BREAST', 'BOTTLE_FORMULA', 'BOTTLE_BREAST_MILK', 'SOLID');
CREATE TYPE "Side" AS ENUM ('LEFT', 'RIGHT', 'BOTH');
CREATE TYPE "DiaperType" AS ENUM ('WET', 'DIRTY', 'MIXED', 'DRY');
CREATE TYPE "ActivityCategory" AS ENUM ('SLEEP', 'FEED', 'DIAPER', 'HEALTH', 'GROWTH');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "babies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "babies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users_babies" (
    "userId" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "role" "BabyRole" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_babies_pkey" PRIMARY KEY ("userId", "babyId")
);

CREATE TABLE "growth_records" (
    "id" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "headCircumference" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,
    "note" TEXT,
    CONSTRAINT "growth_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "health_logs" (
    "id" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "type" "HealthType" NOT NULL,
    "value" DOUBLE PRECISION,
    "description" TEXT,
    "symptoms" TEXT[],
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,
    "note" TEXT,
    CONSTRAINT "health_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sleep_logs" (
    "id" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "quality" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sleep_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "feed_logs" (
    "id" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "type" "FeedType" NOT NULL,
    "amount" DOUBLE PRECISION,
    "duration" INTEGER,
    "side" "Side",
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,
    "note" TEXT,
    CONSTRAINT "feed_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "diaper_logs" (
    "id" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "type" "DiaperType" NOT NULL,
    "color" TEXT,
    "texture" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,
    "note" TEXT,
    CONSTRAINT "diaper_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "category" "ActivityCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "sleepId" TEXT,
    "feedId" TEXT,
    "diaperId" TEXT,
    "healthId" TEXT,
    "growthId" TEXT,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "session_userId_idx" ON "session"("userId");
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
CREATE INDEX "account_userId_idx" ON "account"("userId");
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");
CREATE INDEX "users_babies_babyId_idx" ON "users_babies"("babyId");
CREATE INDEX "growth_records_babyId_recordedAt_idx" ON "growth_records"("babyId", "recordedAt" DESC);
CREATE INDEX "health_logs_babyId_recordedAt_idx" ON "health_logs"("babyId", "recordedAt" DESC);
CREATE INDEX "sleep_logs_babyId_startTime_idx" ON "sleep_logs"("babyId", "startTime" DESC);
CREATE INDEX "sleep_logs_babyId_endTime_idx" ON "sleep_logs"("babyId", "endTime");
CREATE INDEX "feed_logs_babyId_recordedAt_idx" ON "feed_logs"("babyId", "recordedAt" DESC);
CREATE INDEX "diaper_logs_babyId_recordedAt_idx" ON "diaper_logs"("babyId", "recordedAt" DESC);
CREATE UNIQUE INDEX "activity_logs_sleepId_key" ON "activity_logs"("sleepId");
CREATE UNIQUE INDEX "activity_logs_feedId_key" ON "activity_logs"("feedId");
CREATE UNIQUE INDEX "activity_logs_diaperId_key" ON "activity_logs"("diaperId");
CREATE UNIQUE INDEX "activity_logs_healthId_key" ON "activity_logs"("healthId");
CREATE UNIQUE INDEX "activity_logs_growthId_key" ON "activity_logs"("growthId");
CREATE INDEX "activity_logs_babyId_recordedAt_idx" ON "activity_logs"("babyId", "recordedAt" DESC);

ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "users_babies" ADD CONSTRAINT "users_babies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "users_babies" ADD CONSTRAINT "users_babies_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "babies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "growth_records" ADD CONSTRAINT "growth_records_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "babies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "health_logs" ADD CONSTRAINT "health_logs_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "babies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sleep_logs" ADD CONSTRAINT "sleep_logs_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "babies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feed_logs" ADD CONSTRAINT "feed_logs_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "babies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "diaper_logs" ADD CONSTRAINT "diaper_logs_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "babies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "babies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_sleepId_fkey" FOREIGN KEY ("sleepId") REFERENCES "sleep_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "feed_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_diaperId_fkey" FOREIGN KEY ("diaperId") REFERENCES "diaper_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_healthId_fkey" FOREIGN KEY ("healthId") REFERENCES "health_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_growthId_fkey" FOREIGN KEY ("growthId") REFERENCES "growth_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
