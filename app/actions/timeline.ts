"use server";

import {
  BabyRole,
  DiaperLog,
  DiaperType,
  FeedLog,
  FeedType,
  GrowthRecord,
  HealthLog,
  HealthType,
  SleepLog,
} from "@/app/generated/prisma/client";
import {
  getSessionOrThrow,
  verifyBabyAccess,
  withBabyAccess,
} from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type TimelineItem = {
  id: string;
  category: "SLEEP" | "FEED" | "DIAPER" | "HEALTH" | "GROWTH";
  title: string;
  details: string;
  recordedAt: Date;
  metadata?: SleepLog | FeedLog | DiaperLog | HealthLog | GrowthRecord;
};

export const getTimeline = withBabyAccess(
  async (babyId: string, limit = 20): Promise<TimelineItem[]> => {
    const [sleepLogs, feedLogs, diaperLogs, healthLogs, growthRecords] =
      await Promise.all([
        prisma.sleepLog.findMany({
          where: { babyId },
          orderBy: { startTime: "desc" },
          take: limit,
        }),
        prisma.feedLog.findMany({
          where: { babyId },
          orderBy: { recordedAt: "desc" },
          take: limit,
        }),
        prisma.diaperLog.findMany({
          where: { babyId },
          orderBy: { recordedAt: "desc" },
          take: limit,
        }),
        prisma.healthLog.findMany({
          where: { babyId },
          orderBy: { recordedAt: "desc" },
          take: limit,
        }),
        prisma.growthRecord.findMany({
          where: { babyId },
          orderBy: { recordedAt: "desc" },
          take: limit,
        }),
      ]);

    const timeline: TimelineItem[] = [];

    // Transform Sleep Logs
    sleepLogs.forEach((log) => {
      const duration = log.endTime
        ? `${Math.round((log.endTime.getTime() - log.startTime.getTime()) / (1000 * 60))}m`
        : "Sleeping...";

      timeline.push({
        id: log.id,
        category: "SLEEP",
        title: log.endTime ? "Sleep" : "Sleeping",
        details: `${duration} ${log.quality ? `(${log.quality})` : ""}`,
        recordedAt: log.startTime,
        metadata: log,
      });
    });

    // Transform Feed Logs
    feedLogs.forEach((log) => {
      let title = "Feed";
      let details = "";

      switch (log.type) {
        case FeedType.BREAST:
          title = "Breast Feed";
          details = `${log.side} side, ${log.duration}m`;
          break;
        case FeedType.BOTTLE_FORMULA:
          title = "Bottle (Formula)";
          details = `${log.amount}ml, ${log.note || ""}`;
          break;
        case FeedType.BOTTLE_BREAST_MILK:
          title = "Bottle (Breast Milk)";
          details = `${log.amount}ml`;
          break;
        case FeedType.SOLID:
          title = "Solid Food";
          details = log.note || "";
          break;
      }

      timeline.push({
        id: log.id,
        category: "FEED",
        title,
        details,
        recordedAt: log.recordedAt,
        metadata: log,
      });
    });

    // Transform Diaper Logs
    diaperLogs.forEach((log) => {
      let details = "";
      switch (log.type) {
        case DiaperType.WET:
        case DiaperType.DRY:
          details = log.note || "";
          break;
        case DiaperType.DIRTY:
        case DiaperType.MIXED:
          details = `${log.color}, ${log.texture}, ${log.note || ""}`;
          break;
      }

      timeline.push({
        id: log.id,
        category: "DIAPER",
        title: "Diaper Change",
        details,
        recordedAt: log.recordedAt,
        metadata: log,
      });
    });

    // Transform Health Logs
    healthLogs.forEach((log) => {
      let title = "Health Log";
      let details = "";

      switch (log.type) {
        case HealthType.TEMPERATURE:
          title = "Temperature";
          details = `${log.value}°C`;
          break;
        case HealthType.VACCINE:
          title = "Vaccine";
          details = log.description || "";
          break;
        case HealthType.MEDICINE:
          title = "Medicine";
          details = log.description || "";
          break;
        case HealthType.SYMPTOM:
          title = "Symptom";
          details = log.symptoms.join(", ");
          break;
        default:
          details = log.description || log.note || "";
      }

      timeline.push({
        id: log.id,
        category: "HEALTH",
        title,
        details,
        recordedAt: log.recordedAt,
        metadata: log,
      });
    });

    // Transform Growth Records
    growthRecords.forEach((log) => {
      const parts = [];
      if (log.height) parts.push(`H: ${log.height}cm`);
      if (log.weight) parts.push(`W: ${log.weight}kg`);
      if (log.headCircumference) parts.push(`HC: ${log.headCircumference}cm`);

      timeline.push({
        id: log.id,
        category: "GROWTH",
        title: "Growth Check",
        details: parts.join(", "),
        recordedAt: log.recordedAt,
        metadata: log,
      });
    });

    // Sort by recordedAt desc
    return timeline
      .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())
      .slice(0, limit);
  },
);

export async function deleteTimelineRecord(
  id: string,
  category: "SLEEP" | "FEED" | "DIAPER" | "HEALTH" | "GROWTH",
) {
  await getSessionOrThrow();

  let babyId: string | undefined;

  // 1. Find the record first to get babyId
  switch (category) {
    case "SLEEP":
      const sleep = await prisma.sleepLog.findUnique({ where: { id } });
      babyId = sleep?.babyId;
      break;
    case "FEED":
      const feed = await prisma.feedLog.findUnique({ where: { id } });
      babyId = feed?.babyId;
      break;
    case "DIAPER":
      const diaper = await prisma.diaperLog.findUnique({ where: { id } });
      babyId = diaper?.babyId;
      break;
    case "HEALTH":
      const health = await prisma.healthLog.findUnique({ where: { id } });
      babyId = health?.babyId;
      break;
    case "GROWTH":
      const growth = await prisma.growthRecord.findUnique({ where: { id } });
      babyId = growth?.babyId;
      break;
  }

  if (!babyId) {
    throw new Error("Record not found");
  }

  // 2. Verify access BEFORE deleting
  await verifyBabyAccess(babyId, BabyRole.ADMIN);

  // 3. Delete the record
  switch (category) {
    case "SLEEP":
      await prisma.sleepLog.delete({ where: { id } });
      break;
    case "FEED":
      await prisma.feedLog.delete({ where: { id } });
      break;
    case "DIAPER":
      await prisma.diaperLog.delete({ where: { id } });
      break;
    case "HEALTH":
      await prisma.healthLog.delete({ where: { id } });
      break;
    case "GROWTH":
      await prisma.growthRecord.delete({ where: { id } });
      break;
  }

  revalidatePath("/");
}
