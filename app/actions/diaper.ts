"use server";

import { BabyRole, DiaperType } from "@/app/generated/prisma/client";
import {
  buildActivityLogData,
  buildActivityLogUpdate,
  getDiaperSummary,
} from "@/lib/activity-log";
import { checkBabyPermission } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { authActionClient, getBabyActionClient } from "@/lib/safe-action";
import { logDiaperSchema, uuidSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const logDiaper = getBabyActionClient(BabyRole.ADMIN)
  .schema(logDiaperSchema)
  .action(async ({ parsedInput, ctx }) => {
    const recordedAt = parsedInput.recordedAt || new Date();
    const summary = getDiaperSummary(
      parsedInput.type as DiaperType,
      parsedInput.color,
      parsedInput.texture,
      parsedInput.note,
    );

    const log = await prisma.diaperLog.create({
      data: {
        babyId: parsedInput.babyId,
        type: parsedInput.type as DiaperType,
        color: parsedInput.color,
        texture: parsedInput.texture,
        note: parsedInput.note,
        recordedAt,
        recordedBy: ctx.session.user.id,
        activityLog: {
          create: buildActivityLogData({
            babyId: parsedInput.babyId,
            category: "DIAPER",
            recordedAt,
            summary,
          }),
        },
      },
    });

    revalidatePath("/");
    return log;
  });

export const updateDiaper = authActionClient
  .schema(
    z.object({
      id: uuidSchema,
      data: logDiaperSchema.omit({ babyId: true }),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { id, data } = parsedInput;
    const diaper = await prisma.diaperLog.findUnique({ where: { id } });
    if (!diaper) throw new Error("Diaper record not found");

    await checkBabyPermission(
      diaper.babyId,
      ctx.session.user.id,
      BabyRole.ADMIN,
    );

    const recordedAt = data.recordedAt || new Date();
    const summary = getDiaperSummary(
      data.type as DiaperType,
      data.color,
      data.texture,
      data.note,
    );

    const log = await prisma.diaperLog.update({
      where: { id },
      data: {
        type: data.type as DiaperType,
        color: data.color,
        texture: data.texture,
        note: data.note,
        recordedAt,
        activityLog: {
          upsert: {
            create: buildActivityLogData({
              babyId: diaper.babyId,
              category: "DIAPER",
              recordedAt,
              summary,
            }),
            update: buildActivityLogUpdate({
              recordedAt,
              summary,
            }),
          },
        },
      },
    });

    revalidatePath("/");
    return log;
  });
