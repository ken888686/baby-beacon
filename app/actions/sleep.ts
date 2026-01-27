"use server";

import { BabyRole } from "@/app/generated/prisma/client";
import { verifyBabyAccess } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { logSleepSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function logSleep(data: {
  babyId: string;
  startTime: Date;
  endTime?: Date;
  quality?: string;
}) {
  await verifyBabyAccess(data.babyId, BabyRole.ADMIN);
  const validated = logSleepSchema.parse(data);

  const log = await prisma.sleepLog.create({
    data: {
      babyId: validated.babyId,
      startTime: validated.startTime,
      endTime: validated.endTime,
      quality: validated.quality,
    },
  });

  revalidatePath("/");
  return log;
}

export async function startSleep(babyId: string) {
  await verifyBabyAccess(babyId, BabyRole.ADMIN);
  
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
  await verifyBabyAccess(babyId, BabyRole.ADMIN);

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
