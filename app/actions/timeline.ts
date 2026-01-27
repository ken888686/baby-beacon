"use server";

import prisma from "@/lib/prisma";
import { FeedType, HealthType, DiaperType } from "@/app/generated/prisma/client";

export type TimelineItem = {
  id: string;
  category: "SLEEP" | "FEED" | "DIAPER" | "HEALTH" | "GROWTH";
  title: string;
  details: string;
  recordedAt: Date;
  metadata: any; // 保留原始資料
};

export async function getTimeline(babyId: string, limit = 20): Promise<TimelineItem[]> {
  const [sleepLogs, feedLogs, diaperLogs, healthLogs, growthRecords] = await Promise.all([
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
        details = `${log.side} side, ${log.duration ? Math.round(log.duration / 60) + "m" : ""}`;
        break;
      case FeedType.BOTTLE_FORMULA:
        title = "Bottle (Formula)";
        details = `${log.amount}ml`;
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
    let details = log.type as string;
    if (log.color || log.texture) {
      details += ` (${[log.color, log.texture].filter(Boolean).join(", ")})`;
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
  return timeline.sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime()).slice(0, limit);
}
