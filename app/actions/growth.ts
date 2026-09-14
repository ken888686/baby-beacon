"use server";

import { BabyRole } from "@/app/generated/prisma/client";
import {
  buildActivityLogData,
  buildActivityLogUpdate,
  getGrowthSummary,
} from "@/lib/activity-log";
import { requireBabyRecordPermission } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { authActionClient, getBabyActionClient } from "@/lib/safe-action";
import { logGrowthSchema, uuidSchema } from "@/lib/schemas";
import { revalidateDashboard } from "@/lib/revalidation";
import { z } from "zod";

export const logGrowth = getBabyActionClient(BabyRole.ADMIN)
  .schema(logGrowthSchema)
  .action(async ({ parsedInput, ctx }) => {
    const recordedAt = parsedInput.recordedAt || new Date();
    const log = await prisma.growthRecord.create({
      data: {
        babyId: parsedInput.babyId,
        height: parsedInput.height,
        weight: parsedInput.weight,
        headCircumference: parsedInput.headCircumference,
        note: parsedInput.note,
        recordedAt,
        recordedBy: ctx.session.user.id,
        activityLog: {
          create: buildActivityLogData({
            babyId: parsedInput.babyId,
            category: "GROWTH",
            recordedAt,
            summary: getGrowthSummary(parsedInput),
          }),
        },
      },
    });

    revalidateDashboard();
    return log;
  });

export const updateGrowth = authActionClient
  .schema(
    z.object({
      id: uuidSchema,
      data: logGrowthSchema.omit({ babyId: true }),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const growth = await requireBabyRecordPermission(
      await prisma.growthRecord.findUnique({
        where: { id: parsedInput.id },
      }),
      "Growth",
      ctx.session.user.id,
      BabyRole.ADMIN,
    );

    const input = { ...parsedInput.data, babyId: growth.babyId };
    const recordedAt = parsedInput.data.recordedAt || new Date();
    const summary = getGrowthSummary(input);
    const log = await prisma.growthRecord.update({
      where: { id: growth.id },
      data: {
        ...parsedInput.data,
        recordedAt,
        activityLog: {
          upsert: {
            create: buildActivityLogData({
              babyId: growth.babyId,
              category: "GROWTH",
              recordedAt,
              summary,
            }),
            update: buildActivityLogUpdate({ recordedAt, summary }),
          },
        },
      },
    });

    revalidateDashboard();
    return log;
  });
