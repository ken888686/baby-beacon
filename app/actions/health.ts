"use server";

import { BabyRole, HealthType } from "@/app/generated/prisma/client";
import { verifyBabyAccess } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { logHealthSchema } from "@/lib/schemas";
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
  await verifyBabyAccess(data.babyId, BabyRole.ADMIN);
  const validated = logHealthSchema.parse(data);

  const log = await prisma.healthLog.create({
    data: {
      babyId: validated.babyId,
      type: validated.type as HealthType,
      value: validated.value,
      description: validated.description,
      symptoms: validated.symptoms,
      note: validated.note,
      recordedAt: validated.recordedAt || new Date(),
    },
  });

  revalidatePath("/");
  return log;
}
