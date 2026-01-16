"use server";
import prisma from "@/lib/prisma";

export async function getSpots() {
  try {
    const spots = await prisma.spot.findMany({
      // 1. 排序：最新的地點排前面
      orderBy: {
        createdAt: "desc",
      },
      // 2. 關聯讀取 (Eager Loading)
      include: {
        // 抓取對應的類別 (Category)
        category: true,

        // 抓取關聯的設施 (Facilities) - 隱式多對多，超乾淨！
        facilities: true,

        // 抓取筆記 (Notes)，只抓公開的，或者屬於當前使用者的(這裡先抓全部示範)
        notes: {
          include: {
            user: {
              select: { name: true }, // 只撈使用者名字，不撈 email (個資保護)
            },
          },
        },
      },
    });

    return spots;
  } catch (error) {
    console.error("Error fetching spots:", error);
    throw new Error("Failed to fetch spots");
  }
}
