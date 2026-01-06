import { db } from ".";
import {
  categories,
  facilities,
  spots,
  spotsToFacilities,
  users,
} from "./schema";

async function main() {
  console.log("🌱 Drizzle Seeding: 開始種植納戸町資料...");

  // 1. 建立設施 (upsert 邏輯: 如果 code 存在就不動作)
  const facilitiesData = [
    { code: "nursing_room", label: "哺乳室" },
    { code: "diaper_table", label: "尿布台" },
    { code: "stroller_access", label: "推車友善" },
    { code: "hot_water", label: "熱水供應" },
  ];

  console.log("Inserting Facilities...");

  // 為了簡單起見，這裡先刪除舊資料 (開發階段適用) 或使用 insert().onConflictDoNothing()
  // 這裡示範簡單的 insert 流程，實際專案建議用 upsert
  await db.insert(facilities).values(facilitiesData).onConflictDoNothing();

  // 撈回剛建立的資料以取得 ID
  const allFacilities = await db.select().from(facilities);
  const facilityMap = new Map(allFacilities.map((f) => [f.code, f.id]));

  // 2. 建立類別
  const categoriesData = [
    { slug: "medical", name: "醫療急救", iconName: "Stethoscope" },
    { slug: "shopping", name: "母嬰購物", iconName: "ShoppingBag" },
    { slug: "food", name: "親子餐廳", iconName: "Utensils" },
  ];

  console.log("Inserting Categories...");
  await db.insert(categories).values(categoriesData).onConflictDoNothing();

  const allCategories = await db.select().from(categories);
  const categoryMap = new Map(allCategories.map((c) => [c.slug, c.id]));

  // 3. 建立地點 (納戸町周邊)
  console.log("Inserting Spots...");

  // 準備資料
  const spotsInput = [
    {
      name: "東京女子医科大学病院",
      categorySlug: "medical",
      facilities: [
        "nursing_room",
        "diaper_table",
        "stroller_access",
        "hot_water",
      ],
      data: {
        description: "大型綜合醫院，有夜間急診。",
        address: "東京都新宿区河田町8-1",
        lat: 35.69843088825347,
        lng: 139.7203372572399,
        url: "http://www.twmu.ac.jp/info-twmu/",
      },
    },
    {
      name: "キッチンコート神楽坂店",
      categorySlug: "shopping",
      facilities: ["stroller_access"],
      data: {
        description: "附近的主力超市。",
        address: "東京都新宿区箪笥町11-1",
        lat: 35.70114926120141,
        lng: 139.73454223632723,
        url: "http://www.keiostore.co.jp/",
      },
    },
  ];

  for (const item of spotsInput) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) continue;

    // A. 插入 Spot
    const [insertedSpot] = await db
      .insert(spots)
      .values({
        name: item.name,
        categoryId: categoryId,
        ...item.data,
      })
      .returning({ id: spots.id }); // 重要：取得剛插入的 ID

    // B. 插入中介表 (Spot <-> Facility)
    const relationData = item.facilities
      .map((code) => facilityMap.get(code))
      .filter((id): id is number => id !== undefined)
      .map((facilityId) => ({
        spotId: insertedSpot.id,
        facilityId: facilityId,
      }));

    if (relationData.length > 0) {
      await db
        .insert(spotsToFacilities)
        .values(relationData)
        .onConflictDoNothing();
    }
  }

  // 4. 建立使用者 Aaron
  await db
    .insert(users)
    .values({
      email: "ken888686@gmail.com",
      name: "Aaron",
      role: "ADMIN",
    })
    .onConflictDoNothing();

  console.log("✅ Seeding 完成！");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
