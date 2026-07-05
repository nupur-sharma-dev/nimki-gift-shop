import { prisma } from "@/lib/prisma";
import type { PaginatedResponse } from "@/types";

export interface AdminCategoryListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
}

interface GetAdminCategoriesOptions {
  search?: string;
  status?: "active" | "inactive" | "all";
  page?: number;
  limit?: number;
}

export async function getAdminCategories({
  search,
  status = "all",
  page = 1,
  limit = 20,
}: GetAdminCategoriesOptions): Promise<PaginatedResponse<AdminCategoryListItem>> {
  const skip = (page - 1) * limit;

  const where: {
    isActive?: boolean;
    name?: { contains: string; mode: "insensitive" };
  } = {};

  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  if (search && search.trim()) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const [data, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.category.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: data.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      isActive: c.isActive,
      sortOrder: c.sortOrder,
      productCount: c._count.products,
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

export async function getAdminCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
}

interface CategoryInput {
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
}

function validateCategoryInput(data: Partial<CategoryInput>): string | null {
  if (!data.name || data.name.trim().length < 2) {
    return "Category name is required.";
  }
  if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) {
    return "Slug must contain only lowercase letters, numbers, and hyphens.";
  }
  if (
    data.sortOrder !== undefined &&
    (typeof data.sortOrder !== "number" ||
      !Number.isInteger(data.sortOrder) ||
      data.sortOrder < 0)
  ) {
    return "Sort order must be a non-negative whole number.";
  }
  return null;
}

export async function createCategory(data: CategoryInput) {
  const validationError = validateCategoryInput(data);
  if (validationError) {
    return { success: false as const, error: validationError };
  }

  const slugTaken = await prisma.category.findUnique({ where: { slug: data.slug } });
  if (slugTaken) {
    return { success: false as const, error: "A category with this slug already exists." };
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),
        slug: data.slug,
        description: data.description,
        image: data.image,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return { success: true as const, data: category };
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return { success: false as const, error: "A category with this slug already exists." };
    }
    throw err;
  }
}

export async function updateCategory(id: string, data: CategoryInput) {
  const validationError = validateCategoryInput(data);
  if (validationError) {
    return { success: false as const, error: validationError };
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return { success: false as const, error: "Category not found." };
  }

  const slugTaken = await prisma.category.findFirst({
    where: { slug: data.slug, id: { not: id } },
  });
  if (slugTaken) {
    return { success: false as const, error: "A category with this slug already exists." };
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name.trim(),
        slug: data.slug,
        description: data.description,
        image: data.image,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return { success: true as const, data: category };
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return { success: false as const, error: "A category with this slug already exists." };
    }
    throw err;
  }
}

export async function toggleCategoryActive(id: string, isActive: boolean) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return { success: false as const, error: "Category not found." };
  }

  const category = await prisma.category.update({
    where: { id },
    data: { isActive },
  });

  return { success: true as const, data: category };
}