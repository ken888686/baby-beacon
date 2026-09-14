import "dotenv/config";
import { type Prisma } from "../app/generated/prisma/client";
import {
  getDiaperSummary,
  getFeedSummary,
  getGrowthSummary,
  getHealthSummary,
  getSleepSummary,
} from "../lib/activity-log";
import prisma from "../lib/prisma";

async function backfillActivityLogs(tx: Prisma.TransactionClient) {
  const counts = {
    sleep: 0,
    feed: 0,
    diaper: 0,
    health: 0,
    growth: 0,
  };

  const sleepLogs = await tx.sleepLog.findMany({
    where: { activityLog: null },
  });
  for (const record of sleepLogs) {
    const summary = getSleepSummary(
      record.startTime,
      record.endTime,
      record.quality,
    );
    await tx.activityLog.upsert({
      where: { sleepId: record.id },
      update: {},
      create: {
        babyId: record.babyId,
        category: "SLEEP",
        title: summary.title,
        details: summary.details,
        recordedAt: record.startTime,
        sleepId: record.id,
      },
    });
    counts.sleep += 1;
  }

  const feedLogs = await tx.feedLog.findMany({
    where: { activityLog: null },
  });
  for (const record of feedLogs) {
    const summary = getFeedSummary(
      record.type,
      record.amount,
      record.duration,
      record.side,
      record.note,
    );
    await tx.activityLog.upsert({
      where: { feedId: record.id },
      update: {},
      create: {
        babyId: record.babyId,
        category: "FEED",
        title: summary.title,
        details: summary.details,
        recordedAt: record.recordedAt,
        feedId: record.id,
      },
    });
    counts.feed += 1;
  }

  const diaperLogs = await tx.diaperLog.findMany({
    where: { activityLog: null },
  });
  for (const record of diaperLogs) {
    await tx.activityLog.upsert({
      where: { diaperId: record.id },
      update: {},
      create: {
        babyId: record.babyId,
        category: "DIAPER",
        title: "Diaper Change",
        details: getDiaperSummary(
          record.type,
          record.color,
          record.texture,
          record.note,
        ).details,
        recordedAt: record.recordedAt,
        diaperId: record.id,
      },
    });
    counts.diaper += 1;
  }

  const healthLogs = await tx.healthLog.findMany({
    where: { activityLog: null },
  });
  for (const record of healthLogs) {
    const summary = getHealthSummary(record);
    await tx.activityLog.upsert({
      where: { healthId: record.id },
      update: {},
      create: {
        babyId: record.babyId,
        category: "HEALTH",
        title: summary.title,
        details: summary.details,
        recordedAt: record.recordedAt,
        healthId: record.id,
      },
    });
    counts.health += 1;
  }

  const growthRecords = await tx.growthRecord.findMany({
    where: { activityLog: null },
  });
  for (const record of growthRecords) {
    await tx.activityLog.upsert({
      where: { growthId: record.id },
      update: {},
      create: {
        babyId: record.babyId,
        category: "GROWTH",
        title: "Growth Check",
        details: getGrowthSummary(record).details,
        recordedAt: record.recordedAt,
        growthId: record.id,
      },
    });
    counts.growth += 1;
  }

  return counts;
}

async function main() {
  const counts = await prisma.$transaction((tx) => backfillActivityLogs(tx));
  console.log("ActivityLog backfill complete:", counts);
}

main()
  .catch((error) => {
    console.error("ActivityLog backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
