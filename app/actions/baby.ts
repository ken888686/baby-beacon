"use server";

import { BabyRole, Gender } from "@/app/generated/prisma/client";
import { getSessionOrThrow, withBabyAccess } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { createBabySchema, updateBabySchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createBaby(data: {
  name: string;
  birthDate: Date;
  gender: Gender;
  photoUrl?: string;
}) {
  const session = await getSessionOrThrow();
  const validated = createBabySchema.parse(data);

  const baby = await prisma.baby.create({
    data: {
      ...validated,
      users: {
        create: {
          userId: session.user.id,
          role: BabyRole.OWNER,
        },
      },
    },
  });

  revalidatePath("/");
  return baby;
}

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

export const switchBaby = withBabyAccess(async (babyId: string) => {
  (await cookies()).set("selectedBabyId", babyId);
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

export const updateBaby = withBabyAccess(
  async (
    babyId: string,
    data: {
      name?: string;
      birthDate?: Date;
      gender?: Gender;
      photoUrl?: string;
    },
  ) => {
    const validated = updateBabySchema.parse(data);

    const baby = await prisma.baby.update({
      where: { id: babyId },
      data: validated,
    });

    revalidatePath("/");
    return baby;
  },
  BabyRole.ADMIN,
);

export const deleteBaby = withBabyAccess(async (babyId: string) => {
  await prisma.baby.delete({
    where: { id: babyId },
  });

  const cookieStore = await cookies();
  const selectedId = cookieStore.get("selectedBabyId")?.value;

  if (selectedId === babyId) {
    cookieStore.delete("selectedBabyId");
  }

  revalidatePath("/");
}, BabyRole.OWNER);
