"use server";

import { BabyRole, FeedType, Side } from "@/app/generated/prisma/client";
import { checkBabyPermission } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { authActionClient, getBabyActionClient } from "@/lib/safe-action";
import { logFeedSchema, uuidSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";

function getFeedTitleAndDetails(
  type: FeedType,
  amount?: number | null,
  duration?: number | null,
  side?: Side | null,
  note?: string | null,
) {
  let title = "Feed";
  let details = "";
  switch (type) {
    case "BREAST":
      title = "Breast Feed";
      details = `${side} side, ${duration}m`;
      break;
    case "BOTTLE_FORMULA":
      title = "Bottle (Formula)";
      details = [amount ? `${amount}ml` : null, note]
        .filter(Boolean)
        .join(", ");
      break;
    case "BOTTLE_BREAST_MILK":
      title = "Bottle (Breast Milk)";
      details = `${amount}ml`;
      break;
    case "SOLID":
      title = "Solid Food";
      details = note || "";
      break;
  }
  return { title, details };
}

export const logFeed = getBabyActionClient(BabyRole.ADMIN)
  .schema(logFeedSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { title, details } = getFeedTitleAndDetails(
      parsedInput.type as FeedType,
      parsedInput.amount,
      parsedInput.duration,
      parsedInput.side as Side | undefined,
      parsedInput.note,
    );

    const log = await prisma.feedLog.create({
      data: {
        babyId: parsedInput.babyId,
        type: parsedInput.type as FeedType,
        amount: parsedInput.amount,
        duration: parsedInput.duration,
        side: parsedInput.side as Side,
        note: parsedInput.note,
        recordedAt: parsedInput.recordedAt || new Date(),
        recordedBy: ctx.session.user.id,
        activityLog: {
          create: {
            babyId: parsedInput.babyId,
            category: "FEED",
            title,
            details,
            recordedAt: parsedInput.recordedAt || new Date(),
          },
        },
      },
    });

    revalidatePath("/");
    return log;
  });

export const updateFeed = authActionClient
  .schema(
    z.object({
      id: uuidSchema,
      data: logFeedSchema.omit({ babyId: true }),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { id, data } = parsedInput;
    const feed = await prisma.feedLog.findUnique({ where: { id } });
    if (!feed) throw new Error("Feed record not found");

    await checkBabyPermission(feed.babyId, ctx.session.user.id, BabyRole.ADMIN);

    const { title, details } = getFeedTitleAndDetails(
      data.type as FeedType,
      data.amount,
      data.duration,
      data.side as Side | undefined,
      data.note,
    );

    const log = await prisma.feedLog.update({
      where: { id },
      data: {
        type: data.type as FeedType,
        amount: data.amount,
        duration: data.duration,
        side: data.side as Side,
        note: data.note,
        recordedAt: data.recordedAt || new Date(),
        activityLog: {
          upsert: {
            create: {
              babyId: feed.babyId,
              category: "FEED",
              title,
              details,
              recordedAt: data.recordedAt || new Date(),
            },
            update: {
              title,
              details,
              recordedAt: data.recordedAt || new Date(),
            },
          },
        },
      },
    });

    revalidatePath("/");
    return log;
  });
