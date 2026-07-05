import { prisma } from "@/lib/prisma";
import { MAX_REVIEW_LENGTH } from "@/constants";

// ── Eligibility ────────────────────────────────────────────────────────────
// A user may review a product if they have an Order containing that product
// where paymentStatus is PAID or status is DELIVERED. PAID covers eSewa
// orders today; DELIVERED will start qualifying COD orders once Admin Order
// Management (Ticket 26) can transition order status.

export async function canUserReviewProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      OR: [{ paymentStatus: "PAID" }, { status: "DELIVERED" }],
      items: {
        some: { productId },
      },
    },
    select: { id: true },
  });

  return !!order;
}

export async function getUserReviewForProduct(userId: string, productId: string) {
  return prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
  });
}

// ── Validation ───────────────────────────────────────────────────────────

interface ReviewInput {
  rating: number;
  comment?: string | null;
}

function validateReviewInput(data: ReviewInput): string | null {
  if (
    typeof data.rating !== "number" ||
    !Number.isInteger(data.rating) ||
    data.rating < 1 ||
    data.rating > 5
  ) {
    return "Please select a rating between 1 and 5 stars.";
  }

  if (data.comment && data.comment.length > MAX_REVIEW_LENGTH) {
    return `Comment must be ${MAX_REVIEW_LENGTH} characters or fewer.`;
  }

  return null;
}

// ── Create ───────────────────────────────────────────────────────────────

export async function createReview(
  userId: string,
  productId: string,
  data: ReviewInput
) {
  const validationError = validateReviewInput(data);
  if (validationError) {
    return { success: false as const, error: validationError };
  }

  const eligible = await canUserReviewProduct(userId, productId);
  if (!eligible) {
    return {
      success: false as const,
      error: "You can only review products you've purchased.",
    };
  }

  try {
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: data.rating,
        comment: data.comment?.trim() || null,
        isApproved: false,
      },
    });
    return { success: true as const, data: review };
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return {
        success: false as const,
        error: "You've already reviewed this product.",
      };
    }
    throw err;
  }
}

// ── Update ───────────────────────────────────────────────────────────────
// Editing resets isApproved to false since the content changed and needs
// re-moderation.

export async function updateReview(
  userId: string,
  reviewId: string,
  data: ReviewInput
) {
  const validationError = validateReviewInput(data);
  if (validationError) {
    return { success: false as const, error: validationError };
  }

  const existing = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!existing || existing.userId !== userId) {
    return { success: false as const, error: "Review not found." };
  }

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: data.rating,
      comment: data.comment?.trim() || null,
      isApproved: false,
    },
  });

  return { success: true as const, data: review };
}

// ── Delete ───────────────────────────────────────────────────────────────

export async function deleteReview(userId: string, reviewId: string) {
  const existing = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!existing || existing.userId !== userId) {
    return { success: false as const, error: "Review not found." };
  }

  await prisma.review.delete({ where: { id: reviewId } });
  return { success: true as const };
}