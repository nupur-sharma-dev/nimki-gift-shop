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

  const categories = await Promise.all([
    prisma.category.upsert({
      where:  { slug: "greeting-cards" },
      update: {},
      create: {
        name:        "Greeting Cards",
        slug:        "greeting-cards",
        description: "Handcrafted cards for every occasion",
        isActive:    true,
        sortOrder:   1,
      },
    }),
    prisma.category.upsert({
      where:  { slug: "gift-hampers" },
      update: {},
      create: {
        name:        "Gift Hampers",
        slug:        "gift-hampers",
        description: "Curated gift boxes and hampers",
        isActive:    true,
        sortOrder:   2,
      },
    }),
    prisma.category.upsert({
      where:  { slug: "handmade-jewellery" },
      update: {},
      create: {
        name:        "Handmade Jewellery",
        slug:        "handmade-jewellery",
        description: "Delicate handcrafted jewellery pieces",
        isActive:    true,
        sortOrder:   3,
      },
    }),
    prisma.category.upsert({
      where:  { slug: "scented-candles" },
      update: {},
      create: {
        name:        "Scented Candles",
        slug:        "scented-candles",
        description: "Handpoured candles with natural fragrances",
        isActive:    true,
        sortOrder:   4,
      },
    }),
    prisma.category.upsert({
      where:  { slug: "personalized-gifts" },
      update: {},
      create: {
        name:        "Personalized Gifts",
        slug:        "personalized-gifts",
        description: "Custom name and message gifts",
        isActive:    true,
        sortOrder:   5,
      },
    }),
  ]);

  console.log("Categories created:", categories.length);

  const products = await Promise.all([
    prisma.product.upsert({
      where:  { slug: "handwritten-love-card" },
      update: {},
      create: {
        name:        "Handwritten Love Card",
        slug:        "handwritten-love-card",
        description: "A beautifully crafted handwritten love card made with premium cardstock and hand-lettered calligraphy. Perfect for anniversaries, birthdays, and heartfelt moments.",
        price:       350,
        comparePrice:500,
        stock:       50,
        images:      [],
        isFeatured:  true,
        isActive:    true,
        categoryId:  categories[0].id,
      },
    }),
    prisma.product.upsert({
      where:  { slug: "luxury-gift-hamper" },
      update: {},
      create: {
        name:        "Luxury Gift Hamper",
        slug:        "luxury-gift-hamper",
        description: "A premium curated gift hamper with handpicked artisan items including candles, chocolates, and handmade accessories beautifully arranged in a keepsake box.",
        price:       2500,
        comparePrice:3200,
        stock:       20,
        images:      [],
        isFeatured:  true,
        isActive:    true,
        categoryId:  categories[1].id,
      },
    }),
    prisma.product.upsert({
      where:  { slug: "rose-gold-bracelet" },
      update: {},
      create: {
        name:        "Rose Gold Bracelet",
        slug:        "rose-gold-bracelet",
        description: "Handcrafted rose gold plated bracelet with delicate floral charms. Each piece is individually crafted to ensure uniqueness.",
        price:       850,
        comparePrice:1200,
        stock:       30,
        images:      [],
        isFeatured:  true,
        isActive:    true,
        categoryId:  categories[2].id,
      },
    }),
    prisma.product.upsert({
      where:  { slug: "lavender-dreams-candle" },
      update: {},
      create: {
        name:        "Lavender Dreams Candle",
        slug:        "lavender-dreams-candle",
        description: "Handpoured soy wax candle infused with pure lavender essential oil. Burns cleanly for up to 40 hours with a calming, soothing fragrance.",
        price:       650,
        comparePrice:800,
        stock:       45,
        images:      [],
        isFeatured:  false,
        isActive:    true,
        categoryId:  categories[3].id,
      },
    }),
    prisma.product.upsert({
      where:  { slug: "custom-name-keychain" },
      update: {},
      create: {
        name:        "Custom Name Keychain",
        slug:        "custom-name-keychain",
        description: "Personalized hand-stamped metal keychain with your chosen name or message. A thoughtful everyday reminder of someone special.",
        price:       450,
        comparePrice:600,
        stock:       60,
        images:      [],
        isFeatured:  false,
        isActive:    true,
        categoryId:  categories[4].id,
      },
    }),
  ]);

  console.log("Products created:", products.length);

  await prisma.siteSettings.upsert({
    where:  { id: "default" },
    update: {},
    create: {
      id:              "default",
      heroImages:      [],
      announcementBar: "Free shipping on orders above Rs. 2000",
      isStoreOpen:     true,
    },
  });

  console.log("Site settings created");
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