import {
  BabyCreateInput,
  UserCreateInput,
} from "@/app/generated/prisma/models";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const babyData: BabyCreateInput = {
  name: "baby",
  birthDate: new Date("2026-03-23"),
  gender: "MALE",
};

const userData: UserCreateInput = {
  email: "ken888686@gmail.com",
  name: "Aaron",
  babies: {
    create: babyData,
  },
};

async function main() {
  await prisma.user.upsert({
    where: { email: userData.email },
    create: userData,
    update: userData,
  });
}

main();
