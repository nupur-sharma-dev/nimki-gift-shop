import { prisma } from "@/lib/prisma";
import { getGiftRecommendations } from "@/lib/gemini";
import type { ProductCard } from "@/types";

const MAX_CATALOG_SIZE = 60;
const MAX_PICKS = 6;

interface GiftPickResult {
  product: ProductCard;
  reason: string;
}

type GiftFinderResult =
  | { success: true; picks: GiftPickResult[] }
  | { success: false; error: string };

export async function getGiftFinderRecommendations(
  description: string
): Promise<GiftFinderResult> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
    },
    take: MAX_CATALOG_SIZE,
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      reviews: {
        where: { isApproved: true },
        select: { rating: true },
      },
    },
  });

  if (products.length === 0) {
    return {
      success: false,
      error: "There are no products available to recommend right now.",
    };
  }

  const catalogText = products
    .map((p) => {
      const shortDesc =
        p.description.length > 150
          ? `${p.description.slice(0, 150)}...`
          : p.description;
      return `- id: ${p.id} | name: ${p.name} | category: ${
        p.category?.name ?? "Uncategorized"
      } | price: NPR ${p.price} | description: ${shortDesc}`;
    })
    .join("\n");

  const result = await getGiftRecommendations(description, catalogText);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  const picks: GiftPickResult[] = result.picks
    .filter((pick) => productMap.has(pick.productId))
    .slice(0, MAX_PICKS)
    .map((pick) => {
      const product = productMap.get(pick.productId)!;
      const reviews = product.reviews || [];
      const totalReviews = reviews.length;
      const averageRating =
        totalReviews > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

      const productCard: ProductCard = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        comparePrice: product.comparePrice,
        stock: product.stock,
        images: product.images,
        categoryId: product.categoryId,
        category: product.category || undefined,
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
      };

      return { product: productCard, reason: pick.reason };
    });

  return { success: true, picks };
}