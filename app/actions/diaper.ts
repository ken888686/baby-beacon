"use server";

import { BabyRole, DiaperType } from "@/app/generated/prisma/client";
import { verifyBabyAccess } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { logDiaperSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function logDiaper(data: {
  babyId: string;
  type: DiaperType;
  color?: string;
  texture?: string;
  note?: string;
  recordedAt?: Date;
}) {
  const session = await verifyBabyAccess(data.babyId, BabyRole.ADMIN);
  const validated = logDiaperSchema.parse(data);

  const log = await prisma.diaperLog.create({
    data: {
      babyId: validated.babyId,
      type: validated.type as DiaperType,
      color: validated.color,
      texture: validated.texture,
      note: validated.note,
      recordedAt: validated.recordedAt || new Date(),
      recordedBy: session.user.id,
    },
  });

  revalidatePath("/");
  return log;
}

export async function updateDiaper(
  id: string,
  data: {
    type: DiaperType;
    color?: string;
    texture?: string;
    note?: string;
    recordedAt?: Date;
  },
) {
  const diaper = await prisma.diaperLog.findUnique({ where: { id } });
  if (!diaper) throw new Error("Diaper record not found");

  await verifyBabyAccess(diaper.babyId, BabyRole.ADMIN);
  const validated = logDiaperSchema.parse({ ...data, babyId: diaper.babyId });

  const log = await prisma.diaperLog.update({
    where: { id },
    data: {
      type: validated.type as DiaperType,
      color: validated.color,
      texture: validated.texture,
      note: validated.note,
      recordedAt: validated.recordedAt || new Date(),
    },
  });

  revalidatePath("/");
  return log;
}
