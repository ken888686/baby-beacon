"use server";

import { BabyRole, DiaperType } from "@/app/generated/prisma/client";
import { checkBabyPermission } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { authActionClient, getBabyActionClient } from "@/lib/safe-action";
import { logDiaperSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";

function getDiaperDetails(
  type: DiaperType,
  color?: string | null,
  texture?: string | null,
  note?: string | null,
) {
  if (type === "WET" || type === "DRY") return note || "";
  return [color, texture, note].filter(Boolean).join(", ");
}

export const logDiaper = getBabyActionClient(BabyRole.ADMIN)
  .schema(logDiaperSchema)
  .action(async ({ parsedInput, ctx }) => {
    const details = getDiaperDetails(
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
        recordedAt: parsedInput.recordedAt || new Date(),
        recordedBy: ctx.session.user.id,
        activityLog: {
          create: {
            babyId: parsedInput.babyId,
            category: "DIAPER",
            title: "Diaper Change",
            details,
            recordedAt: parsedInput.recordedAt || new Date(),
          },
        },
      },
    });

    revalidatePath("/");
    return log;
  });

export const updateDiaper = authActionClient
  .schema(
    z.object({
      id: z.string(),
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

    const details = getDiaperDetails(
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
        recordedAt: data.recordedAt || new Date(),
        activityLog: {
          upsert: {
            create: {
              babyId: diaper.babyId,
              category: "DIAPER",
              title: "Diaper Change",
              details,
              recordedAt: data.recordedAt || new Date(),
            },
            update: {
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
