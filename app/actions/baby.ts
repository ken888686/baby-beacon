"use server";

import { BabyRole, Gender } from "@/app/generated/prisma/client";
import { getSessionOrThrow, verifyBabyAccess } from "@/lib/auth-utils";
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

export async function getBabies() {
  const session = await getSessionOrThrow();
  return await prisma.baby.findMany({
    where: {
      users: {
        some: {
          userId: session.user.id,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getBaby(id: string) {
  await verifyBabyAccess(id);
  return await prisma.baby.findUnique({
    where: { id },
  });
}

export async function switchBaby(babyId: string) {
  await verifyBabyAccess(babyId);
  (await cookies()).set("selectedBabyId", babyId);
  revalidatePath("/");
}

export async function getBabyStats(babyId: string) {
  await verifyBabyAccess(babyId);
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
}

export async function updateBaby(
  babyId: string,
  data: {
    name?: string;
    birthDate?: Date;
    gender?: Gender;
    photoUrl?: string;
  },
) {
  await verifyBabyAccess(babyId, BabyRole.ADMIN);
  const validated = updateBabySchema.parse(data);

  const baby = await prisma.baby.update({
    where: { id: babyId },
    data: validated,
  });

  revalidatePath("/");
  return baby;
}

export async function deleteBaby(babyId: string) {
  await verifyBabyAccess(babyId, BabyRole.OWNER);
  
  await prisma.baby.delete({
    where: { id: babyId },
  });

  const cookieStore = await cookies();
  const selectedId = cookieStore.get("selectedBabyId")?.value;

  if (selectedId === babyId) {
    cookieStore.delete("selectedBabyId");
  }

  revalidatePath("/");
}
