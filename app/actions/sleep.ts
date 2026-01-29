"use server";

import { BabyRole } from "@/app/generated/prisma/client";
import { getSessionOrThrow, withBabyAccess } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const startSleep = withBabyAccess(async (babyId: string) => {
  const session = await getSessionOrThrow();
  // Check if there is already an active sleep session
  const activeSleep = await prisma.sleepLog.findFirst({
    where: {
      babyId,
      endTime: null,
    },
  });

  if (activeSleep) {
    throw new Error("Baby is already sleeping");
  }

  const sleep = await prisma.sleepLog.create({
    data: {
      babyId,
      startTime: new Date(),
      recordedBy: session.user.id,
    },
  });

  revalidatePath("/");
  return sleep;
}, BabyRole.ADMIN);

export const endSleep = withBabyAccess(async (babyId: string) => {
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

  const sleep = await prisma.sleepLog.update({
    where: { id: activeSleep.id },
    data: {
      endTime: new Date(),
    },
  });

  revalidatePath("/");
  return sleep;
}, BabyRole.ADMIN);

export const logSleep = withBabyAccess(
  async (
    babyId: string,
    data: {
      startTime: Date;
      endTime?: Date;
      quality?: string;
      note?: string;
    },
  ) => {
    // Basic validation
    if (data.endTime && data.startTime > data.endTime) {
      throw new Error("Start time must be before end time");
    }

    const sleep = await prisma.sleepLog.create({
      data: {
        babyId,
        startTime: data.startTime,
        endTime: data.endTime,
        quality: data.quality,
      },
    });

    revalidatePath("/");
    return sleep;
  },
  BabyRole.ADMIN,
);
