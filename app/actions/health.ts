"use server";

import { BabyRole, HealthType } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { getBabyActionClient } from "@/lib/safe-action";
import { logHealthSchema } from "@/lib/schemas";
import { revalidatePath, revalidateTag } from "next/cache";

export const logHealth = getBabyActionClient(BabyRole.ADMIN)
  .schema(logHealthSchema)
  .action(async ({ parsedInput, ctx }) => {
    let title = "Health Log";
    let details = parsedInput.description || parsedInput.note || "";
    switch (parsedInput.type) {
      case HealthType.TEMPERATURE:
        title = "Temperature";
        details = `${parsedInput.value}°C`;
        break;
      case HealthType.VACCINE:
        title = "Vaccine";
        break;
      case HealthType.MEDICINE:
        title = "Medicine";
        break;
      case HealthType.SYMPTOM:
        title = "Symptom";
        details = parsedInput.symptoms?.join(", ") || "";
        break;
    }

    const log = await prisma.healthLog.create({
      data: {
        babyId: parsedInput.babyId,
        type: parsedInput.type as HealthType,
        value: parsedInput.value,
        description: parsedInput.description,
        symptoms: parsedInput.symptoms,
        note: parsedInput.note,
        recordedAt: parsedInput.recordedAt || new Date(),
        recordedBy: ctx.session.user.id,
        activityLog: {
          create: {
            babyId: parsedInput.babyId,
            category: "HEALTH",
            title,
            details,
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
