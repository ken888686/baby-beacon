import { PrismaClient, Role } from "@/app/generated/prisma/client";
import {
  CategoryCreateInput,
  FacilityCreateInput,
  SpotCreateWithoutNotesInput,
  UserCreateInput,
} from "@/app/generated/prisma/models";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData: UserCreateInput = {
  email: "ken888686@gmail.com",
  name: "Aaron",
  role: Role.ADMIN,
};

const facilitiesData: FacilityCreateInput[] = [
  { code: "nursing_room", label: "哺乳室" },
  { code: "diaper_table", label: "尿布台" },
  { code: "stroller_access", label: "推車友善" },
  { code: "hot_water", label: "熱水供應" },
];
const categoriesData: CategoryCreateInput[] = [
  { slug: "medical", name: "醫療急救", iconName: "Stethoscope" },
  { slug: "shopping", name: "母嬰購物", iconName: "ShoppingBag" },
  { slug: "food", name: "親子餐廳", iconName: "Utensils" },
];

const spotsData: SpotCreateWithoutNotesInput[] = [
  {
    name: "東京女子医科大学病院",
    description: "大型綜合醫院，有夜間急診。",
    address: "東京都新宿区河田町8-1",
    lat: 35.69843088825347,
    lng: 139.7203372572399,
    url: "http://www.twmu.ac.jp/info-twmu/",
    category: {
      connect: { slug: "medical" },
    },
    facilities: {
      connect: [
        { code: "nursing_room" },
        { code: "diaper_table" },
        { code: "stroller_access" },
        { code: "hot_water" },
      ],
    },
  },
  {
    name: "キッチンコート神楽坂店",
    description: "附近的主力超市。",
    address: "東京都新宿区箪笥町11-1",
    lat: 35.70114926120141,
    lng: 139.73454223632723,
    url: "http://www.keiostore.co.jp/",
    category: {
      connect: { slug: "shopping" },
    },
    facilities: {
      connect: [{ code: "stroller_access" }],
    },
  },
];

export async function main() {
  console.log("checking users...");
  await prisma.user
    .upsert({
      where: { email: userData.email },
      create: userData,
      update: {},
    })
    .then(() => {
      console.log("users already exist");
    });

  console.log("inserting facilities...");
  await prisma.facility.createMany({
    data: facilitiesData,
    skipDuplicates: true,
  });

  console.log("inserting categories...");
  await prisma.category.createMany({
    data: categoriesData,
    skipDuplicates: true,
  });

  console.log("checking spots...");
  await prisma.spot
    .findMany({
      select: { name: true },
      where: {
        name: {
          in: spotsData.map((s) => s.name),
        },
      },
    })
    .then(async (data) => {
      if (data.length === 0) {
        console.log("inserting spots...");
        await Promise.all(
          spotsData.map((spot) =>
            prisma.spot.create({
              data: spot,
            }),
          ),
        );
      }
    });
}

main();
