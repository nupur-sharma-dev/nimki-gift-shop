import { prisma } from "@/lib/prisma";
import type { PaginatedResponse } from "@/types";

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  category: { id: string; name: string } | null;
}

interface GetAdminProductsOptions {
  search?: string;
  categoryId?: string;
  status?: "active" | "inactive" | "all";
  page?: number;
  limit?: number;
}

export async function getAdminProducts({
  search,
  categoryId,
  status = "all",
  page = 1,
  limit = 20,
}: GetAdminProductsOptions): Promise<PaginatedResponse<AdminProductListItem>> {
  const skip = (page - 1) * limit;

  const where: {
    isActive?: boolean;
    categoryId?: string;
    OR?: Array<{ name?: { contains: string; mode: "insensitive" }; sku?: { contains: string; mode: "insensitive" } }>;
  } = {};

  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;
  if (categoryId) where.categoryId = categoryId;

  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: data.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      comparePrice: p.comparePrice,
      stock: p.stock,
      images: p.images,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      category: p.category,
    })),
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

export async function getAdminProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true } } },
  });
}

interface ProductInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  sku: string | null;
  images: string[];
  categoryId: string;
  isFeatured: boolean;
}

function validateProductInput(data: Partial<ProductInput>): string | null {
  if (!data.name || data.name.trim().length < 2) {
    return "Product name is required.";
  }
  if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) {
    return "Slug must contain only lowercase letters, numbers, and hyphens.";
  }
  if (!data.description || data.description.trim().length < 10) {
    return "Description must be at least 10 characters.";
  }
  if (typeof data.price !== "number" || Number.isNaN(data.price) || data.price <= 0) {
    return "Price must be a positive number.";
  }
  if (
    data.comparePrice !== null &&
    data.comparePrice !== undefined &&
    data.comparePrice <= data.price
  ) {
    return "Compare-at price must be greater than the regular price.";
  }
  if (
    typeof data.stock !== "number" ||
    !Number.isInteger(data.stock) ||
    data.stock < 0
  ) {
    return "Stock must be a non-negative whole number.";
  }
  if (!data.categoryId) {
    return "Please select a category.";
  }
  if (!data.images || data.images.length === 0) {
    return "At least one product image is required.";
  }
  return null;
}

export async function createProduct(data: ProductInput) {
  const validationError = validateProductInput(data);
  if (validationError) {
    return { success: false as const, error: validationError };
  }

  const [slugTaken, skuTaken] = await Promise.all([
    prisma.product.findUnique({ where: { slug: data.slug } }),
    data.sku ? prisma.product.findUnique({ where: { sku: data.sku } }) : null,
  ]);

  if (slugTaken) {
    return { success: false as const, error: "A product with this slug already exists." };
  }
  if (skuTaken) {
    return { success: false as const, error: "A product with this SKU already exists." };
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        slug: data.slug,
        description: data.description.trim(),
        price: data.price,
        comparePrice: data.comparePrice,
        stock: data.stock,
        sku: data.sku || null,
        images: data.images,
        categoryId: data.categoryId,
        isFeatured: data.isFeatured,
      },
    });
    return { success: true as const, data: product };
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return {
        success: false as const,
        error: "A product with this slug or SKU already exists.",
      };
    }
    throw err;
  }
}

export async function updateProduct(id: string, data: ProductInput) {
  const validationError = validateProductInput(data);
  if (validationError) {
    return { success: false as const, error: validationError };
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return { success: false as const, error: "Product not found." };
  }

  const [slugTaken, skuTaken] = await Promise.all([
    prisma.product.findFirst({ where: { slug: data.slug, id: { not: id } } }),
    data.sku
      ? prisma.product.findFirst({ where: { sku: data.sku, id: { not: id } } })
      : null,
  ]);

  if (slugTaken) {
    return { success: false as const, error: "A product with this slug already exists." };
  }
  if (skuTaken) {
    return { success: false as const, error: "A product with this SKU already exists." };
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name.trim(),
        slug: data.slug,
        description: data.description.trim(),
        price: data.price,
        comparePrice: data.comparePrice,
        stock: data.stock,
        sku: data.sku || null,
        images: data.images,
        categoryId: data.categoryId,
        isFeatured: data.isFeatured,
      },
    });
    return { success: true as const, data: product };
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return {
        success: false as const,
        error: "A product with this slug or SKU already exists.",
      };
    }
    throw err;
  }
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return { success: false as const, error: "Product not found." };
  }

  const product = await prisma.product.update({
    where: { id },
    data: { isActive },
  });

  return { success: true as const, data: product };
}