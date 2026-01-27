"use server";

import prisma from "@/lib/prisma";
import { Gender } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";

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
