"use server";

import { Gender } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createBaby(data: {
  userId: string;
  name: string;
  birthDate: Date;
  gender: Gender;
  photoUrl?: string;
}) {
  const baby = await prisma.baby.create({
    data: {
      name: data.name,
      birthDate: data.birthDate,
      gender: data.gender,
      photoUrl: data.photoUrl,
      users: {
        create: {
          userId: data.userId,
          role: "OWNER",
        },
      },
    },
  });

  revalidatePath("/");
  return baby;
}

export async function getBabies(userId: string) {
  return await prisma.baby.findMany({
    where: {
      users: {
        some: {
          userId: userId,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getBaby(id: string) {
  return await prisma.baby.findUnique({
    where: { id },
  });
}

export async function switchBaby(babyId: string) {
  (await cookies()).set("selectedBabyId", babyId);
  revalidatePath("/");
}

export async function getBabyStats(babyId: string) {
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
  const baby = await prisma.baby.update({
    where: { id: babyId },
    data,
  });

  revalidatePath("/");
  return baby;
}

export async function deleteBaby(babyId: string) {
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
