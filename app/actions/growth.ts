"use server";

import { BabyRole } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { getBabyActionClient } from "@/lib/safe-action";
import { logGrowthSchema } from "@/lib/schemas";
import { revalidatePath, revalidateTag } from "next/cache";

export const logGrowth = getBabyActionClient(BabyRole.ADMIN)
  .schema(logGrowthSchema)
  .action(async ({ parsedInput, ctx }) => {
    const log = await prisma.growthRecord.create({
      data: {
        babyId: parsedInput.babyId,
        height: parsedInput.height,
        weight: parsedInput.weight,
        headCircumference: parsedInput.headCircumference,
        note: parsedInput.note,
        recordedAt: parsedInput.recordedAt || new Date(),
        recordedBy: ctx.session.user.id,
        activityLog: {
          create: {
            babyId: parsedInput.babyId,
            category: "GROWTH",
            title: "Growth Check",
            details: [
              parsedInput.height ? `H: ${parsedInput.height}cm` : null,
              parsedInput.weight ? `W: ${parsedInput.weight}kg` : null,
              parsedInput.headCircumference
                ? `HC: ${parsedInput.headCircumference}cm`
                : null,
            ]
              .filter(Boolean)
              .join(", "),
            recordedAt: parsedInput.recordedAt || new Date(),
          },
        },
      },
    });

    revalidatePath("/");
    // @ts-expect-error Next.js 16 type workaround
    revalidateTag(`timeline-${parsedInput.babyId}`);
    return log;
  });
