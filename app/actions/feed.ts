"use server";

import prisma from "@/lib/prisma";
import { FeedType, Side } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function logFeed(data: {
  babyId: string;
  type: FeedType;
  amount?: number;
  duration?: number;
  side?: Side;
  note?: string;
  recordedAt?: Date;
}) {
  const log = await prisma.feedLog.create({
    data: {
      babyId: data.babyId,
      type: data.type,
      amount: data.amount,
      duration: data.duration,
      side: data.side,
      note: data.note,
      recordedAt: data.recordedAt || new Date(),
    },
  });

  revalidatePath("/");
  return log;
}
