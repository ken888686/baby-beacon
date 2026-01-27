"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function logSleep(data: {
  babyId: string;
  startTime: Date;
  endTime?: Date;
  quality?: string;
}) {
  const log = await prisma.sleepLog.create({
    data: {
      babyId: data.babyId,
      startTime: data.startTime,
      endTime: data.endTime,
      quality: data.quality,
    },
  });

  revalidatePath("/");
  return log;
}

export async function startSleep(babyId: string) {
  // Check if already sleeping
  const currentSleep = await prisma.sleepLog.findFirst({
    where: {
      babyId,
      endTime: null,
    },
  });

  if (currentSleep) {
    throw new Error("Baby is already sleeping");
  }

  const log = await prisma.sleepLog.create({
    data: {
      babyId,
      startTime: new Date(),
    },
  });

  revalidatePath("/");
  return log;
}

export async function stopSleep(babyId: string) {
  const currentSleep = await prisma.sleepLog.findFirst({
    where: {
      babyId,
      endTime: null,
    },
  });

  if (!currentSleep) {
    throw new Error("No active sleep session found");
  }

  const log = await prisma.sleepLog.update({
    where: { id: currentSleep.id },
    data: {
      endTime: new Date(),
    },
  });

  revalidatePath("/");
  return log;
}
