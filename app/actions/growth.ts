"use server";

import { BabyRole } from "@/app/generated/prisma/client";
import { verifyBabyAccess } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { logGrowthSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function logGrowth(data: {
  babyId: string;
  height?: number;
  weight?: number;
  headCircumference?: number;
  note?: string;
  recordedAt?: Date;
}) {
  await verifyBabyAccess(data.babyId, BabyRole.ADMIN);
  const validated = logGrowthSchema.parse(data);

  const log = await prisma.growthRecord.create({
    data: {
      babyId: validated.babyId,
      height: validated.height,
      weight: validated.weight,
      headCircumference: validated.headCircumference,
      note: validated.note,
      recordedAt: validated.recordedAt || new Date(),
    },
  });

  revalidatePath("/");
  return log;
}
