"use server";

import { BabyRole, FeedType, Side } from "@/app/generated/prisma/client";
import { verifyBabyAccess } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { logFeedSchema } from "@/lib/schemas";
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
  const session = await verifyBabyAccess(data.babyId, BabyRole.ADMIN);
  const validated = logFeedSchema.parse(data);

  const log = await prisma.feedLog.create({
    data: {
      babyId: validated.babyId,
      type: validated.type as FeedType,
      amount: validated.amount,
      duration: validated.duration,
      side: validated.side as Side,
      note: validated.note,
      recordedAt: validated.recordedAt || new Date(),
      recordedBy: session.user.id,
    },
  });

  revalidatePath("/");
  return log;
}
