import { prisma } from "@/lib/prisma";
import { getOrSetCache } from "@/lib/redis";
import type { ProductFilters, SortOption, PaginatedResponse, ProductCard } from "@/types";

interface GetProductsOptions {
  filters?: ProductFilters;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

type PrismaWhereInput = {
  isActive: boolean;
  categoryId?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  stock?: {
    gt: number;
  };
  OR?: Array<{
    name?: { contains: string; mode: "insensitive" };
    description?: { contains: string; mode: "insensitive" };
  }>;
};

type PrismaOrderByInput = {
  createdAt?: "asc" | "desc";
  price?: "asc" | "desc";
};

const CATEGORY_BY_SLUG_TTL = 600; // 10 minutes
const ALL_CATEGORIES_TTL = 600; // 10 minutes
const PRODUCT_BY_SLUG_TTL = 180; // 3 minutes

export async function getCategoryBySlug(slug: string) {
  return getOrSetCache(`category:slug:${slug}`, CATEGORY_BY_SLUG_TTL, async () => {
    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!category) return null;

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      productCount: category._count.products,
    };
  });
}

export async function getProducts({
  filters = {},
  sort = "newest",
  page = 1,
  limit = 12,
}: GetProductsOptions): Promise<PaginatedResponse<ProductCard>> {
  const skip = (page - 1) * limit;

  // Build where clause
  const where: PrismaWhereInput = {
    isActive: true,
  };

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  if (filters.inStock) {
    where.stock = { gt: 0 };
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  // Build orderBy
  let orderBy: PrismaOrderByInput = {};
  switch (sort) {
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "popular":
    case "rating":
    default:
      orderBy = { createdAt: "desc" };
  }

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          select: {
            rating: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Calculate average rating for each product
  const productsWithRating: ProductCard[] = data.map((product) => {
    const reviews = product.reviews || [];
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    return {
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
  });

  const totalPages = Math.ceil(total / limit);

  return {
    data: productsWithRating,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export async function getProductBySlug(slug: string) {
  return getOrSetCache(`product:slug:${slug}`, PRODUCT_BY_SLUG_TTL, async () => {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) return null;

    const reviews = product.reviews || [];
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    return {
      ...product,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
    };
  });
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit: number = 4
): Promise<ProductCard[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId,
      id: { not: productId },
    },
    take: limit,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      reviews: {
        where: { isApproved: true },
        select: {
          rating: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map((product) => {
    const reviews = product.reviews || [];
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    return {
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
  });
}

export async function getAllCategoriesWithCounts() {
  return getOrSetCache("categories:all-with-counts", ALL_CATEGORIES_TTL, async () => {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      productCount: cat._count.products,
    }));
  });
}