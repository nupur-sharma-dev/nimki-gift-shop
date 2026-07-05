import { prisma } from "@/lib/prisma";
import { PAGINATION } from "@/constants";
import type { PaginatedResponse } from "@/types";

export type AdminReviewStatusFilter = "ALL" | "PENDING" | "APPROVED";

interface GetAdminReviewsParams {
  page?: number;
  limit?: number;
  status?: AdminReviewStatusFilter;
  search?: string;
}

export interface AdminReviewListItem {
  id: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  isFlagged: boolean;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export async function getAdminReviews({
  page = PAGINATION.DEFAULT_PAGE,
  limit = PAGINATION.ADMIN_LIMIT,
  status = "ALL",
  search = "",
}: GetAdminReviewsParams): Promise<PaginatedResponse<AdminReviewListItem>> {
  const where: Record<string, unknown> = {};

  if (status === "PENDING") {
    where.isApproved = false;
  } else if (status === "APPROVED") {
    where.isApproved = true;
  }

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    where.OR = [
      { product: { name: { contains: trimmedSearch, mode: "insensitive" } } },
      { user: { name: { contains: trimmedSearch, mode: "insensitive" } } },
      { user: { email: { contains: trimmedSearch, mode: "insensitive" } } },
    ];
  }

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, slug: true, images: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data: reviews,
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

export async function getAdminReviewById(id: string) {
  return prisma.review.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, slug: true, images: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function approveReview(id: string) {
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) {
    return { success: false as const, error: "Review not found." };
  }

  const review = await prisma.review.update({
    where: { id },
    data: { isApproved: true },
  });

  return { success: true as const, data: review };
}

// Reject is a permanent hard delete — the one deliberate exception to the
// project's soft-delete convention. There is no "rejected" state to retain;
// once rejected, the review row is gone.
export async function rejectReview(id: string) {
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) {
    return { success: false as const, error: "Review not found." };
  }

  await prisma.review.delete({ where: { id } });
  return { success: true as const };
}