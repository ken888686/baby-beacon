"use server";

import prisma from "@/lib/prisma";
import { DiaperType } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function logDiaper(data: {
  babyId: string;
  type: DiaperType;
  color?: string;
  texture?: string;
  note?: string;
  recordedAt?: Date;
}) {
  const log = await prisma.diaperLog.create({
    data: {
      babyId: data.babyId,
      type: data.type,
      color: data.color,
      texture: data.texture,
      note: data.note,
      recordedAt: data.recordedAt || new Date(),
    },
  });

  revalidatePath("/");
  return log;
}
