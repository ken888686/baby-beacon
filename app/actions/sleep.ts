"use server";

import { BabyRole } from "@/app/generated/prisma/client";
import { checkBabyPermission } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { authActionClient, getBabyActionClient } from "@/lib/safe-action";
import { logSleepSchema, uuidSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";

function getSleepDetails(
  startTime: Date,
  endTime?: Date | null,
  quality?: string | null,
) {
  if (!endTime) return { title: "Sleeping", details: "Sleeping..." };
  const duration = `${Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))}m`;
  const details = `${duration} ${quality ? `(${quality})` : ""}`.trim();
  return { title: "Sleep", details };
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
    const sleep = await prisma.sleepLog.create({
      data: {
        babyId,
        startTime,
        recordedBy: ctx.session.user.id,
        activityLog: {
          create: {
            babyId,
            category: "SLEEP",
            ...getSleepDetails(startTime),
            recordedAt: startTime,
          },
        },
      },
    });

    revalidatePath("/");
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
          update: {
            ...getSleepDetails(
              activeSleep.startTime,
              endTime,
              activeSleep.quality,
            ),
          },
        },
      },
    });

    revalidatePath("/");
    return sleep;
  });

export const logSleep = getBabyActionClient(BabyRole.ADMIN)
  .schema(logSleepSchema)
  .action(async ({ parsedInput }) => {
    if (parsedInput.endTime && parsedInput.startTime > parsedInput.endTime) {
      throw new Error("Start time must be before end time");
    }

    const { title, details } = getSleepDetails(
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
          create: {
            babyId: parsedInput.babyId,
            category: "SLEEP",
            title,
            details,
            recordedAt: parsedInput.startTime,
          },
        },
      },
    });

    revalidatePath("/");
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
    if (!sleepLog) throw new Error("Sleep record not found");

    await checkBabyPermission(
      sleepLog.babyId,
      ctx.session.user.id,
      BabyRole.ADMIN,
    );

    const { title, details } = getSleepDetails(
      data.startTime,
      data.endTime,
      data.quality,
    );

    const updateData: Parameters<typeof prisma.sleepLog.update>[0]["data"] = {
      startTime: data.startTime,
      endTime: data.endTime,
      quality: data.quality,
    };

    if (sleepLog.activityLog) {
      updateData.activityLog = {
        update: {
          title,
          details,
          recordedAt: data.startTime,
        },
      };
    } else {
      updateData.activityLog = {
        create: {
          babyId: sleepLog.babyId,
          category: "SLEEP",
          title,
          details,
          recordedAt: data.startTime,
        },
      };
    }

    const sleep = await prisma.sleepLog.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/");
    return sleep;
  });
