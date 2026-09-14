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
  checkBabyPermission,
  getSessionOrThrow,
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

type TimelineCategory = TimelineItem["category"];

function getLegacyTimelineItem(
  category: TimelineCategory,
  log: SleepLog | FeedLog | DiaperLog | HealthLog | GrowthRecord,
): TimelineItem {
  switch (category) {
    case "SLEEP": {
      const sleep = log as SleepLog;
      const duration = sleep.endTime
        ? `${Math.round((sleep.endTime.getTime() - sleep.startTime.getTime()) / (1000 * 60))}m`
        : "Sleeping...";
      return {
        id: sleep.id,
        category,
        title: sleep.endTime ? "Sleep" : "Sleeping",
        details:
          `${duration} ${sleep.quality ? `(${sleep.quality})` : ""}`.trim(),
        recordedAt: sleep.startTime,
        metadata: sleep,
      };
    }
    case "FEED": {
      const feed = log as FeedLog;
      let title = "Feed";
      let details = "";

      switch (feed.type) {
        case FeedType.BREAST:
          title = "Breast Feed";
          details = `${feed.side ?? "Both"} side, ${feed.duration ?? 0}m`;
          break;
        case FeedType.BOTTLE_FORMULA:
          title = "Bottle (Formula)";
          details = [feed.amount ? `${feed.amount}ml` : null, feed.note]
            .filter(Boolean)
            .join(", ");
          break;
        case FeedType.BOTTLE_BREAST_MILK:
          title = "Bottle (Breast Milk)";
          details = feed.amount ? `${feed.amount}ml` : "";
          break;
        case FeedType.SOLID:
          title = "Solid Food";
          details = feed.note || "";
          break;
      }

      return {
        id: feed.id,
        category,
        title,
        details,
        recordedAt: feed.recordedAt,
        metadata: feed,
      };
    }
    case "DIAPER": {
      const diaper = log as DiaperLog;
      const details =
        diaper.type === DiaperType.WET || diaper.type === DiaperType.DRY
          ? diaper.note || ""
          : [diaper.color, diaper.texture, diaper.note]
              .filter(Boolean)
              .join(", ");
      return {
        id: diaper.id,
        category,
        title: "Diaper Change",
        details,
        recordedAt: diaper.recordedAt,
        metadata: diaper,
      };
    }
    case "HEALTH": {
      const health = log as HealthLog;
      let title = "Health Log";
      let details = health.description || health.note || "";

      switch (health.type) {
        case HealthType.TEMPERATURE:
          title = "Temperature";
          details = health.value === null ? "" : `${health.value}°C`;
          break;
        case HealthType.VACCINE:
          title = "Vaccine";
          break;
        case HealthType.MEDICINE:
          title = "Medicine";
          break;
        case HealthType.SYMPTOM:
          title = "Symptom";
          details = health.symptoms.join(", ");
          break;
      }

      return {
        id: health.id,
        category,
        title,
        details,
        recordedAt: health.recordedAt,
        metadata: health,
      };
    }
    case "GROWTH": {
      const growth = log as GrowthRecord;
      const details = [
        growth.height ? `H: ${growth.height}cm` : null,
        growth.weight ? `W: ${growth.weight}kg` : null,
        growth.headCircumference ? `HC: ${growth.headCircumference}cm` : null,
      ]
        .filter(Boolean)
        .join(", ");
      return {
        id: growth.id,
        category,
        title: "Growth Check",
        details,
        recordedAt: growth.recordedAt,
        metadata: growth,
      };
    }
  }
}

export const getTimeline = withBabyAccess(
  async (babyId: string, limit = 20): Promise<TimelineItem[]> => {
    const [
      activityLogs,
      sleepLogs,
      feedLogs,
      diaperLogs,
      healthLogs,
      growthRecords,
    ] = await Promise.all([
      prisma.activityLog.findMany({
        where: { babyId },
        include: {
          sleep: true,
          feed: true,
          diaper: true,
          health: true,
          growth: true,
        },
        orderBy: { recordedAt: "desc" },
        take: limit,
      }),
      prisma.sleepLog.findMany({
        where: { babyId, activityLog: null },
        orderBy: { startTime: "desc" },
        take: limit,
      }),
      prisma.feedLog.findMany({
        where: { babyId, activityLog: null },
        orderBy: { recordedAt: "desc" },
        take: limit,
      }),
      prisma.diaperLog.findMany({
        where: { babyId, activityLog: null },
        orderBy: { recordedAt: "desc" },
        take: limit,
      }),
      prisma.healthLog.findMany({
        where: { babyId, activityLog: null },
        orderBy: { recordedAt: "desc" },
        take: limit,
      }),
      prisma.growthRecord.findMany({
        where: { babyId, activityLog: null },
        orderBy: { recordedAt: "desc" },
        take: limit,
      }),
    ]);

    const currentItems: TimelineItem[] = activityLogs.map((log) => ({
      id: log.id,
      category: log.category,
      title: log.title,
      details: log.details,
      recordedAt: log.recordedAt,
      metadata:
        log.sleep ||
        log.feed ||
        log.diaper ||
        log.health ||
        log.growth ||
        undefined,
    }));
    const legacyItems = [
      ...sleepLogs.map((log) => getLegacyTimelineItem("SLEEP", log)),
      ...feedLogs.map((log) => getLegacyTimelineItem("FEED", log)),
      ...diaperLogs.map((log) => getLegacyTimelineItem("DIAPER", log)),
      ...healthLogs.map((log) => getLegacyTimelineItem("HEALTH", log)),
      ...growthRecords.map((log) => getLegacyTimelineItem("GROWTH", log)),
    ];

    return [...currentItems, ...legacyItems]
      .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())
      .slice(0, limit);
  },
);

export async function deleteTimelineRecord(
  id: string,
  legacyCategory?: TimelineCategory,
) {
  const session = await getSessionOrThrow();

  const activity = await prisma.activityLog.findUnique({
    where: { id },
  });

  if (activity) {
    await checkBabyPermission(activity.babyId, session.user.id, BabyRole.ADMIN);

    switch (activity.category) {
      case "SLEEP":
        if (activity.sleepId)
          await prisma.sleepLog.delete({ where: { id: activity.sleepId } });
        break;
      case "FEED":
        if (activity.feedId)
          await prisma.feedLog.delete({ where: { id: activity.feedId } });
        break;
      case "DIAPER":
        if (activity.diaperId)
          await prisma.diaperLog.delete({ where: { id: activity.diaperId } });
        break;
      case "HEALTH":
        if (activity.healthId)
          await prisma.healthLog.delete({ where: { id: activity.healthId } });
        break;
      case "GROWTH":
        if (activity.growthId)
          await prisma.growthRecord.delete({
            where: { id: activity.growthId },
          });
        break;
    }
  } else if (legacyCategory) {
    switch (legacyCategory) {
      case "SLEEP": {
        const record = await prisma.sleepLog.findUnique({ where: { id } });
        if (!record) throw new Error("Record not found");
        await checkBabyPermission(
          record.babyId,
          session.user.id,
          BabyRole.ADMIN,
        );
        await prisma.sleepLog.delete({ where: { id } });
        break;
      }
      case "FEED": {
        const record = await prisma.feedLog.findUnique({ where: { id } });
        if (!record) throw new Error("Record not found");
        await checkBabyPermission(
          record.babyId,
          session.user.id,
          BabyRole.ADMIN,
        );
        await prisma.feedLog.delete({ where: { id } });
        break;
      }
      case "DIAPER": {
        const record = await prisma.diaperLog.findUnique({ where: { id } });
        if (!record) throw new Error("Record not found");
        await checkBabyPermission(
          record.babyId,
          session.user.id,
          BabyRole.ADMIN,
        );
        await prisma.diaperLog.delete({ where: { id } });
        break;
      }
      case "HEALTH": {
        const record = await prisma.healthLog.findUnique({ where: { id } });
        if (!record) throw new Error("Record not found");
        await checkBabyPermission(
          record.babyId,
          session.user.id,
          BabyRole.ADMIN,
        );
        await prisma.healthLog.delete({ where: { id } });
        break;
      }
      case "GROWTH": {
        const record = await prisma.growthRecord.findUnique({ where: { id } });
        if (!record) throw new Error("Record not found");
        await checkBabyPermission(
          record.babyId,
          session.user.id,
          BabyRole.ADMIN,
        );
        await prisma.growthRecord.delete({ where: { id } });
        break;
      }
    }
  } else {
    throw new Error("Record not found");
  }

  revalidatePath("/");
}
