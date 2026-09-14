-- Prisma schema does not currently express partial indexes. Keep this
-- database-level invariant in a migration so concurrent start requests cannot
-- create more than one active sleep per baby.
CREATE UNIQUE INDEX "sleep_logs_one_active_per_baby_idx"
ON "sleep_logs" ("babyId")
WHERE "endTime" IS NULL;
