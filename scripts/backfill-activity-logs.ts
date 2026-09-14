import "dotenv/config";
import {
  DiaperType,
  FeedType,
  HealthType,
  type Prisma,
} from "../app/generated/prisma/client";
import prisma from "../lib/prisma";

function getSleepDetails(
  startTime: Date,
  endTime?: Date | null,
  quality?: string | null,
) {
  if (!endTime) return { title: "Sleeping", details: "Sleeping..." };

  const duration = `${Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60),
  )}m`;
  const details = `${duration} ${quality ? `(${quality})` : ""}`.trim();
  return { title: "Sleep", details };
}

function getFeedDetails(
  type: FeedType,
  amount?: number | null,
  duration?: number | null,
  side?: string | null,
  note?: string | null,
) {
  switch (type) {
    case FeedType.BREAST:
      return { title: "Breast Feed", details: `${side} side, ${duration}m` };
    case FeedType.BOTTLE_FORMULA:
      return {
        title: "Bottle (Formula)",
        details: [amount ? `${amount}ml` : null, note]
          .filter(Boolean)
          .join(", "),
      };
    case FeedType.BOTTLE_BREAST_MILK:
      return { title: "Bottle (Breast Milk)", details: `${amount}ml` };
    case FeedType.SOLID:
      return { title: "Solid Food", details: note || "" };
  }
}

function getDiaperDetails(
  type: DiaperType,
  color?: string | null,
  texture?: string | null,
  note?: string | null,
) {
  if (type === DiaperType.WET || type === DiaperType.DRY) return note || "";
  return [color, texture, note].filter(Boolean).join(", ");
}

function getHealthDetails(record: {
  type: HealthType;
  value: number | null;
  description: string | null;
  symptoms: string[];
  note: string | null;
}) {
  switch (record.type) {
    case HealthType.TEMPERATURE:
      return { title: "Temperature", details: `${record.value}°C` };
    case HealthType.VACCINE:
      return {
        title: "Vaccine",
        details: record.description || record.note || "",
      };
    case HealthType.MEDICINE:
      return {
        title: "Medicine",
        details: record.description || record.note || "",
      };
    case HealthType.SYMPTOM:
      return { title: "Symptom", details: record.symptoms.join(", ") };
    default:
      return {
        title: "Health Log",
        details: record.description || record.note || "",
      };
  }
}

function getGrowthDetails(record: {
  height: number | null;
  weight: number | null;
  headCircumference: number | null;
}) {
  return [
    record.height ? `H: ${record.height}cm` : null,
    record.weight ? `W: ${record.weight}kg` : null,
    record.headCircumference ? `HC: ${record.headCircumference}cm` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

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
    const summary = getSleepDetails(
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
    const summary = getFeedDetails(
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
        details: getDiaperDetails(
          record.type,
          record.color,
          record.texture,
          record.note,
        ),
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
    const summary = getHealthDetails(record);
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
        details: getGrowthDetails(record),
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
