"use server";
import prisma from "@/lib/db";
import { SpotModel } from "@/lib/generated/prisma/models";
import type { ActionResponse } from "@/lib/types";
import { unstable_cache } from "next/cache";

export async function getSpots(): Promise<ActionResponse<SpotModel[]>> {
  try {
    const spots = await prisma.spot.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        facilities: true,
        notes: true,
      },
    });

    return { success: true, data: spots };
  } catch (error) {
    console.error("Error fetching spots:", error);
    return { success: false, error: "Failed to fetch spots" };
  }
}

export const getSpotsss = unstable_cache(
  async (): Promise<ActionResponse<any[]>> => {
    try {
      const spots = await prisma.spot.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          description: true,
          address: true,
          lat: true,
          lng: true,
          url: true,
          category: {
            select: {
              name: true,
              slug: true,
              iconName: true,
            },
          },
          facilities: {
            select: {
              code: true,
              label: true,
            },
          },
          notes: {
            where: {
              isPrivate: false,
            },
            select: {
              content: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return { success: true, data: spots };
    } catch (error) {
      console.error("Error fetching spots:", error);
      return { success: false, error: "Failed to fetch spots" };
    }
  },
  ["spots-list"],
  { revalidate: 3600, tags: ["spots"] },
);
