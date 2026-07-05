/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("Admin@123", 12);

  const admin = await prisma.user.upsert({
    where:  { email: "admin@nimkigiftshop.com" },
    update: {},
    create: {
      name:          "Nimki Admin",
      email:         "admin@nimkigiftshop.com",
      password:      hashedPassword,
      role:          "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("Admin created:", admin.email);
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });