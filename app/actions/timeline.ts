"use server";

import { BabyRole } from "@/app/generated/prisma/client";
import { checkBabyPermission, withBabyAccess } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { type TimelineItem } from "@/lib/timeline";
import { authActionClient } from "@/lib/safe-action";
import { uuidSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type { TimelineCategory, TimelineItem } from "@/lib/timeline";

export const getTimeline = withBabyAccess(
  async (babyId: string, limit = 20): Promise<TimelineItem[]> => {
    const activityLogs = await prisma.activityLog.findMany({
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

    return activityLogs.map((log) => ({
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
  },
);

export const deleteTimelineRecord = authActionClient
  .schema(z.object({ id: uuidSchema }))
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;

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
    } else {
      throw new Error("Record not found");
    }

    revalidatePath("/");
  });
