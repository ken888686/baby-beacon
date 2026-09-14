"use server";

import {
  BabyRole,
  DiaperLog,
  FeedLog,
  GrowthRecord,
  HealthLog,
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

export const getTimeline = withBabyAccess(
  async (babyId: string, limit = 20): Promise<TimelineItem[]> => {
    const logs = await prisma.activityLog.findMany({
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
    });

    return logs.map((log) => ({
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
    })) as TimelineItem[];
  },
);

export async function deleteTimelineRecord(id: string) {
  const session = await getSessionOrThrow();

  const activity = await prisma.activityLog.findUnique({
    where: { id },
  });

  if (!activity) {
    throw new Error("Record not found");
  }

  // 2. Verify access
  await checkBabyPermission(activity.babyId, session.user.id, BabyRole.ADMIN);

  // 3. Delete the original record (which will cascade delete the activityLog)
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
        await prisma.growthRecord.delete({ where: { id: activity.growthId } });
      break;
  }

  // 4. 清除緩存
  // @ts-expect-error next15 generic
  revalidateTag(`timeline-${activity.babyId}`);
  revalidatePath("/");
}
