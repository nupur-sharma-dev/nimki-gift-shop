import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { APP_URL } from "@/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${APP_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${APP_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${APP_URL}/gift-finder`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${APP_URL}/shop/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${APP_URL}/categories/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}