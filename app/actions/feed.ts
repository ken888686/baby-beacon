"use server";

import { BabyRole, FeedType, Side } from "@/app/generated/prisma/client";
import {
  buildActivityLogData,
  buildActivityLogUpdate,
  getFeedSummary,
} from "@/lib/activity-log";
import { requireBabyRecordPermission } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { authActionClient, getBabyActionClient } from "@/lib/safe-action";
import { logFeedSchema, uuidSchema } from "@/lib/schemas";
import { revalidateDashboard } from "@/lib/revalidation";
import { z } from "zod";

export const logFeed = getBabyActionClient(BabyRole.ADMIN)
  .schema(logFeedSchema)
  .action(async ({ parsedInput, ctx }) => {
    const recordedAt = parsedInput.recordedAt || new Date();
    const summary = getFeedSummary(
      parsedInput.type as FeedType,
      parsedInput.amount,
      parsedInput.duration,
      parsedInput.side as Side | undefined,
      parsedInput.note,
    );

    const log = await prisma.feedLog.create({
      data: {
        babyId: parsedInput.babyId,
        type: parsedInput.type as FeedType,
        amount: parsedInput.amount,
        duration: parsedInput.duration,
        side: parsedInput.side as Side,
        note: parsedInput.note,
        recordedAt,
        recordedBy: ctx.session.user.id,
        activityLog: {
          create: buildActivityLogData({
            babyId: parsedInput.babyId,
            category: "FEED",
            recordedAt,
            summary,
          }),
        },
      },
    });

    revalidateDashboard();
    return log;
  });

export const updateFeed = authActionClient
  .schema(
    z.object({
      id: uuidSchema,
      data: logFeedSchema.omit({ babyId: true }),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { id, data } = parsedInput;
    const feed = await requireBabyRecordPermission(
      await prisma.feedLog.findUnique({ where: { id } }),
      "Feed",
      ctx.session.user.id,
      BabyRole.ADMIN,
    );

    const recordedAt = data.recordedAt || new Date();
    const summary = getFeedSummary(
      data.type as FeedType,
      data.amount,
      data.duration,
      data.side as Side | undefined,
      data.note,
    );

    const log = await prisma.feedLog.update({
      where: { id },
      data: {
        type: data.type as FeedType,
        amount: data.amount,
        duration: data.duration,
        side: data.side as Side,
        note: data.note,
        recordedAt,
        activityLog: {
          upsert: {
            create: buildActivityLogData({
              babyId: feed.babyId,
              category: "FEED",
              recordedAt,
              summary,
            }),
            update: buildActivityLogUpdate({
              recordedAt,
              summary,
            }),
          },
        },
      },
    });

    revalidateDashboard();
    return log;
  });
