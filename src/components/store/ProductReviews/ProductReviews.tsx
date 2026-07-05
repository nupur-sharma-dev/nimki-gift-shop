"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { formatDate, getInitials } from "@/utils";
import type { Review } from "@/types";
import ReviewForm from "@/components/store/ReviewForm/ReviewForm";
import styles from "./ProductReviews.module.css";

interface UserReview {
  id: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
}

interface ProductReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  productId: string;
  canReview: boolean;
  userReview?: UserReview | null;
}

export default function ProductReviews({
  reviews,
  averageRating,
  totalReviews,
  productId,
  canReview,
  userReview,
}: ProductReviewsProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!userReview) return;
    if (!confirm("Delete your review? This cannot be undone.")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${userReview.id}`, { method: "DELETE" });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.error || "Could not delete review.");
        return;
      }

      toast.success("Review deleted.");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Count rating distribution
  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++;
    }
  });

  const getPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  return (
    <div className={styles.reviews}>
      {/* Your review card, or write-review CTA */}
      {userReview ? (
        <div className={styles.yourReview}>
          <div className={styles.yourReviewHeader}>
            <span className={styles.yourReviewLabel}>
              {"★".repeat(userReview.rating)}
              {"☆".repeat(5 - userReview.rating)} Your Review
            </span>
            {!userReview.isApproved && (
              <span className={styles.pendingBadge}>Pending Approval</span>
            )}
          </div>
          {userReview.comment && (
            <p className={styles.reviewComment}>{userReview.comment}</p>
          )}
          {!showForm && (
            <div className={styles.yourReviewActions}>
              <button className={styles.editBtn} onClick={() => setShowForm(true)}>
                <i className="bx bx-edit" /> Edit
              </button>
              <button
                className={styles.deleteBtn}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <i className="bx bx-trash" /> {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
          {showForm && (
            <ReviewForm
              productId={productId}
              existingReview={userReview}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      ) : canReview ? (
        showForm ? (
          <ReviewForm productId={productId} onCancel={() => setShowForm(false)} />
        ) : (
          <button className={styles.writeReviewToggle} onClick={() => setShowForm(true)}>
            <i className="bx bx-star" /> Write a Review
          </button>
        )
      ) : null}

      {/* Summary + list, or empty state */}
      {totalReviews === 0 ? (
        <div className={styles.empty}>
          <i className="bx bx-message-detail" />
          <h4 className={styles.emptyTitle}>No reviews yet</h4>
          <p className={styles.emptyText}>
            Be the first to share your thoughts on this product.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.summary}>
            <div className={styles.average}>
              <span className={styles.averageNumber}>{averageRating.toFixed(1)}</span>
              <div className={styles.averageStars}>
                <span className={styles.stars}>
                  {"★".repeat(Math.floor(averageRating))}
                  {averageRating % 1 >= 0.5 && "★"}
                  {"☆".repeat(5 - Math.ceil(averageRating))}
                </span>
                <span className={styles.averageCount}>
                  Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>

            <div className={styles.breakdown}>
              {ratingCounts.map((count, index) => {
                const rating = index + 1;
                const percentage = getPercentage(count);
                return (
                  <div key={rating} className={styles.breakdownRow}>
                    <span className={styles.breakdownLabel}>{rating}★</span>
                    <div className={styles.breakdownBar}>
                      <div
                        className={styles.breakdownFill}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className={styles.breakdownCount}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.list}>
            {reviews.map((review) => (
              <div key={review.id} className={styles.review}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewUser}>
                    {review.user?.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name || "User"}
                        width={40}
                        height={40}
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarFallback}>
                        {getInitials(review.user?.name)}
                      </div>
                    )}
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>
                        {review.user?.name || "Anonymous"}
                      </span>
                      <span className={styles.reviewDate}>
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className={styles.reviewRating}>
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>
                {review.comment && (
                  <p className={styles.reviewComment}>{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}