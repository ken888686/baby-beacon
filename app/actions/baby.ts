"use server";

import { BabyRole } from "@/app/generated/prisma/client";
import { getSessionOrThrow, withBabyAccess } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { authActionClient, getBabyActionClient } from "@/lib/safe-action";
import { createBabySchema, updateBabySchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

export const createBaby = authActionClient
  .schema(createBabySchema)
  .action(async ({ parsedInput, ctx }) => {
    const baby = await prisma.baby.create({
      data: {
        ...parsedInput,
        users: {
          create: {
            userId: ctx.session.user.id,
            role: BabyRole.OWNER,
          },
        },
      },
    });

    revalidatePath("/");
    return baby;
  });

export async function getBabies(userId?: string) {
  const currentUserId = userId || (await getSessionOrThrow()).user.id;
  return await prisma.baby.findMany({
    where: {
      users: {
        some: {
          userId: currentUserId,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export const getBaby = withBabyAccess(async (id: string) => {
  return await prisma.baby.findUnique({
    where: { id },
  });
});

export const switchBaby = getBabyActionClient(BabyRole.VIEWER)
  .schema(z.object({ babyId: z.uuid() }))
  .action(async ({ parsedInput }) => {
    (await cookies()).set("selectedBabyId", parsedInput.babyId);
    revalidatePath("/");
  });

export const getBabyStats = withBabyAccess(async (babyId: string) => {
  const [lastSleep, lastFeed] = await Promise.all([
    prisma.sleepLog.findFirst({
      where: { babyId },
      orderBy: { startTime: "desc" },
    }),
    prisma.feedLog.findFirst({
      where: { babyId },
      orderBy: { recordedAt: "desc" },
    }),
  ]);

  return { lastSleep, lastFeed };
});

export const updateBaby = getBabyActionClient(BabyRole.ADMIN)
  .schema(
    z.object({
      babyId: z.uuid(),
      data: updateBabySchema,
    }),
  )
  .action(async ({ parsedInput }) => {
    const baby = await prisma.baby.update({
      where: { id: parsedInput.babyId },
      data: parsedInput.data,
    });

    revalidatePath("/");
    return baby;
  });

export const deleteBaby = getBabyActionClient(BabyRole.OWNER)
  .schema(z.object({ babyId: z.uuid() }))
  .action(async ({ parsedInput }) => {
    await prisma.baby.delete({
      where: { id: parsedInput.babyId },
    });

    const cookieStore = await cookies();
    const selectedId = cookieStore.get("selectedBabyId")?.value;

    if (selectedId === parsedInput.babyId) {
      cookieStore.delete("selectedBabyId");
    }

    revalidatePath("/");
  });
