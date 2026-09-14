"use server";

import { BabyRole, HealthType } from "@/app/generated/prisma/client";
import { checkBabyPermission } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { authActionClient, getBabyActionClient } from "@/lib/safe-action";
import { logHealthSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";

function getHealthSummary(input: z.infer<typeof logHealthSchema>) {
  let title = "Health Log";
  let details = input.description || input.note || "";

  switch (input.type) {
    case HealthType.TEMPERATURE:
      title = "Temperature";
      details = `${input.value}°C`;
      break;
    case HealthType.VACCINE:
      title = "Vaccine";
      break;
    case HealthType.MEDICINE:
      title = "Medicine";
      break;
    case HealthType.SYMPTOM:
      title = "Symptom";
      details = input.symptoms?.join(", ") || "";
      break;
  }

  return { title, details };
}

export const logHealth = getBabyActionClient(BabyRole.ADMIN)
  .schema(logHealthSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { title, details } = getHealthSummary(parsedInput);

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
    return log;
  });

export const updateHealth = authActionClient
  .schema(
    z.object({
      id: z.string(),
      data: logHealthSchema.omit({ babyId: true }),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const health = await prisma.healthLog.findUnique({ where: { id: parsedInput.id } });
    if (!health) throw new Error("Health record not found");

    await checkBabyPermission(health.babyId, ctx.session.user.id, BabyRole.ADMIN);

    const input = { ...parsedInput.data, babyId: health.babyId };
    const { title, details } = getHealthSummary(input);
    const recordedAt = parsedInput.data.recordedAt || new Date();

    const log = await prisma.healthLog.update({
      where: { id: health.id },
      data: {
        ...parsedInput.data,
        recordedAt,
        activityLog: {
          upsert: {
            create: { babyId: health.babyId, category: "HEALTH", title, details, recordedAt },
            update: { title, details, recordedAt },
          },
        },
      },
    });

    revalidatePath("/");
    return log;
  });
