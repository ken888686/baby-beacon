"use server";

import { BabyRole } from "@/app/generated/prisma/client";
import {
  buildActivityLogData,
  buildActivityLogUpdate,
  getSleepSummary,
} from "@/lib/activity-log";
import { requireBabyRecordPermission } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { authActionClient, getBabyActionClient } from "@/lib/safe-action";
import { logSleepSchema, uuidSchema } from "@/lib/schemas";
import { revalidateDashboard } from "@/lib/revalidation";
import { z } from "zod";

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export const startSleep = getBabyActionClient(BabyRole.ADMIN)
  .schema(z.object({ babyId: uuidSchema }))
  .action(async ({ parsedInput, ctx }) => {
    const { babyId } = parsedInput;

    const activeSleep = await prisma.sleepLog.findFirst({
      where: {
        babyId,
        endTime: null,
      },
    });

    if (activeSleep) {
      throw new Error("Baby is already sleeping");
    }

    const startTime = new Date();
    let sleep: Awaited<ReturnType<typeof prisma.sleepLog.create>>;
    try {
      sleep = await prisma.sleepLog.create({
        data: {
          babyId,
          startTime,
          recordedBy: ctx.session.user.id,
          activityLog: {
            create: buildActivityLogData({
              babyId,
              category: "SLEEP",
              recordedAt: startTime,
              summary: getSleepSummary(startTime),
            }),
          },
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new Error("Baby is already sleeping");
      }
      throw error;
    }

    revalidateDashboard();
    return sleep;
  });

export const endSleep = getBabyActionClient(BabyRole.ADMIN)
  .schema(z.object({ babyId: uuidSchema }))
  .action(async ({ parsedInput }) => {
    const { babyId } = parsedInput;

    const activeSleep = await prisma.sleepLog.findFirst({
      where: {
        babyId,
        endTime: null,
      },
      orderBy: { startTime: "desc" },
    });

    if (!activeSleep) {
      throw new Error("Baby is not currently sleeping");
    }

    const endTime = new Date();
    const sleep = await prisma.sleepLog.update({
      where: { id: activeSleep.id },
      data: {
        endTime,
        activityLog: {
          update: buildActivityLogUpdate({
            summary: getSleepSummary(
              activeSleep.startTime,
              endTime,
              activeSleep.quality,
            ),
            recordedAt: activeSleep.startTime,
          }),
        },
      },
    });

    revalidateDashboard();
    return sleep;
  });

export const logSleep = getBabyActionClient(BabyRole.ADMIN)
  .schema(logSleepSchema)
  .action(async ({ parsedInput }) => {
    if (parsedInput.endTime && parsedInput.startTime > parsedInput.endTime) {
      throw new Error("Start time must be before end time");
    }

    const summary = getSleepSummary(
      parsedInput.startTime,
      parsedInput.endTime,
      parsedInput.quality,
    );

    const sleep = await prisma.sleepLog.create({
      data: {
        babyId: parsedInput.babyId,
        startTime: parsedInput.startTime,
        endTime: parsedInput.endTime,
        quality: parsedInput.quality,
        activityLog: {
          create: buildActivityLogData({
            babyId: parsedInput.babyId,
            category: "SLEEP",
            recordedAt: parsedInput.startTime,
            summary,
          }),
        },
      },
    });

    revalidateDashboard();
    return sleep;
  });

export const updateSleep = authActionClient
  .schema(
    z.object({
      id: uuidSchema,
      data: logSleepSchema.omit({ babyId: true }),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { id, data } = parsedInput;

    if (data.endTime && data.startTime > data.endTime) {
      throw new Error("Start time must be before end time");
    }

    const sleepLog = await prisma.sleepLog.findUnique({
      where: { id },
      include: { activityLog: true },
    });
    const permittedSleepLog = await requireBabyRecordPermission(
      sleepLog,
      "Sleep",
      ctx.session.user.id,
      BabyRole.ADMIN,
    );

    const summary = getSleepSummary(data.startTime, data.endTime, data.quality);

    const updateData: Parameters<typeof prisma.sleepLog.update>[0]["data"] = {
      startTime: data.startTime,
      endTime: data.endTime,
      quality: data.quality,
    };

    if (permittedSleepLog.activityLog) {
      updateData.activityLog = {
        update: buildActivityLogUpdate({
          summary,
          recordedAt: data.startTime,
        }),
      };
    } else {
      updateData.activityLog = {
        create: buildActivityLogData({
          babyId: permittedSleepLog.babyId,
          category: "SLEEP",
          recordedAt: data.startTime,
          summary,
        }),
      };
    }

    const sleep = await prisma.sleepLog.update({
      where: { id: permittedSleepLog.id },
      data: updateData,
    });

    revalidateDashboard();
    return sleep;
  });
