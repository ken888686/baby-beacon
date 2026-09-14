"use server";

import { BabyRole, HealthType } from "@/app/generated/prisma/client";
import {
  buildActivityLogData,
  buildActivityLogUpdate,
  getHealthSummary,
} from "@/lib/activity-log";
import { requireBabyRecordPermission } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { authActionClient, getBabyActionClient } from "@/lib/safe-action";
import { logHealthSchema, uuidSchema } from "@/lib/schemas";
import { revalidateDashboard } from "@/lib/revalidation";
import { z } from "zod";

export const logHealth = getBabyActionClient(BabyRole.ADMIN)
  .schema(logHealthSchema)
  .action(async ({ parsedInput, ctx }) => {
    const recordedAt = parsedInput.recordedAt || new Date();
    const summary = getHealthSummary(parsedInput);

    const log = await prisma.healthLog.create({
      data: {
        babyId: parsedInput.babyId,
        type: parsedInput.type as HealthType,
        value: parsedInput.value,
        description: parsedInput.description,
        symptoms: parsedInput.symptoms,
        note: parsedInput.note,
        recordedAt,
        recordedBy: ctx.session.user.id,
        activityLog: {
          create: buildActivityLogData({
            babyId: parsedInput.babyId,
            category: "HEALTH",
            recordedAt,
            summary,
          }),
        },
      },
    });

    revalidateDashboard();
    return log;
  });

export const updateHealth = authActionClient
  .schema(
    z.object({
      id: uuidSchema,
      data: logHealthSchema.omit({ babyId: true }),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const health = await requireBabyRecordPermission(
      await prisma.healthLog.findUnique({
        where: { id: parsedInput.id },
      }),
      "Health",
      ctx.session.user.id,
      BabyRole.ADMIN,
    );

    const input = { ...parsedInput.data, babyId: health.babyId };
    const summary = getHealthSummary(input);
    const recordedAt = parsedInput.data.recordedAt || new Date();

    const log = await prisma.healthLog.update({
      where: { id: health.id },
      data: {
        ...parsedInput.data,
        recordedAt,
        activityLog: {
          upsert: {
            create: buildActivityLogData({
              babyId: health.babyId,
              category: "HEALTH",
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
