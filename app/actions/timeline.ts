"use server";

import { BabyRole } from "@/app/generated/prisma/client";
import { checkBabyPermission, withBabyAccess } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { mapLegacyTimelineItem, type TimelineItem } from "@/lib/timeline";
import { authActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type { TimelineCategory, TimelineItem } from "@/lib/timeline";

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
      ...sleepLogs.map((log) => mapLegacyTimelineItem("SLEEP", log)),
      ...feedLogs.map((log) => mapLegacyTimelineItem("FEED", log)),
      ...diaperLogs.map((log) => mapLegacyTimelineItem("DIAPER", log)),
      ...healthLogs.map((log) => mapLegacyTimelineItem("HEALTH", log)),
      ...growthRecords.map((log) => mapLegacyTimelineItem("GROWTH", log)),
    ];

    return [...currentItems, ...legacyItems]
      .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())
      .slice(0, limit);
  },
);

export const deleteTimelineRecord = authActionClient
  .schema(
    z.object({
      id: z.uuid(),
      legacyCategory: z
        .enum(["SLEEP", "FEED", "DIAPER", "HEALTH", "GROWTH"])
        .optional(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { id, legacyCategory } = parsedInput;

    const activity = await prisma.activityLog.findUnique({
      where: { id },
    });

    if (activity) {
      await checkBabyPermission(
        activity.babyId,
        ctx.session.user.id,
        BabyRole.ADMIN,
      );

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
            ctx.session.user.id,
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
            ctx.session.user.id,
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
            ctx.session.user.id,
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
            ctx.session.user.id,
            BabyRole.ADMIN,
          );
          await prisma.healthLog.delete({ where: { id } });
          break;
        }
        case "GROWTH": {
          const record = await prisma.growthRecord.findUnique({
            where: { id },
          });
          if (!record) throw new Error("Record not found");
          await checkBabyPermission(
            record.babyId,
            ctx.session.user.id,
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
  });
