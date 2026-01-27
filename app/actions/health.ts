"use server";

import prisma from "@/lib/prisma";
import { HealthType } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function logHealth(data: {
  babyId: string;
  type: HealthType;
  value?: number;
  description?: string;
  symptoms?: string[];
  note?: string;
  recordedAt?: Date;
}) {
  const log = await prisma.healthLog.create({
    data: {
      babyId: data.babyId,
      type: data.type,
      value: data.value,
      description: data.description,
      symptoms: data.symptoms,
      note: data.note,
      recordedAt: data.recordedAt || new Date(),
    },
  });

  revalidatePath("/");
  return log;
}
