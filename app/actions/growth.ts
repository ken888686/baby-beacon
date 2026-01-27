"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function logGrowth(data: {
  babyId: string;
  height?: number;
  weight?: number;
  headCircumference?: number;
  note?: string;
  recordedAt?: Date;
}) {
  const log = await prisma.growthRecord.create({
    data: {
      babyId: data.babyId,
      height: data.height,
      weight: data.weight,
      headCircumference: data.headCircumference,
      note: data.note,
      recordedAt: data.recordedAt || new Date(),
    },
  });

  revalidatePath("/");
  return log;
}
