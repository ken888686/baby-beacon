import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = "ken888686@gmail.com";

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email,
        name: "Aaron",
        babies: {
          create: {
            role: "OWNER",
            baby: {
              create: {
                name: "Liam",
                birthDate: new Date("2026-03-23"),
                gender: "MALE",
              },
            },
          },
        },
      },
    });
    console.log("Seeded user and baby.");
  } else {
    console.log("User already exists.");
  }
}

main();
