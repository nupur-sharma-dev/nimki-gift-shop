"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { MAX_REVIEW_LENGTH } from "@/constants";
import styles from "./ReviewForm.module.css";

interface ExistingReview {
  id: string;
  rating: number;
  comment: string | null;
}

interface ReviewFormProps {
  productId: string;
  existingReview?: ExistingReview | null;
  onCancel?: () => void;
}

export default function ReviewForm({
  productId,
  existingReview,
  onCancel,
}: ReviewFormProps) {
  const router = useRouter();
  const isEditing = !!existingReview;

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayRating = hoverRating || rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(
        isEditing ? `/api/reviews/${existingReview.id}` : "/api/reviews",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, rating, comment }),
        }
      );

      const json = await res.json();

      if (!json.success) {
        toast.error(json.error || "Something went wrong.");
        return;
      }

      toast.success(
        isEditing
          ? "Review updated — pending approval."
          : "Thanks for your review! It will appear once approved."
      );
      onCancel?.();
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h4 className={styles.title}>
        {isEditing ? "Edit Your Review" : "Write a Review"}
      </h4>

      <div className={styles.starInput}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={styles.starBtn}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <i className={star <= displayRating ? "bx bxs-star" : "bx bx-star"} />
          </button>
        ))}
      </div>

      <textarea
        className={styles.textarea}
        placeholder="Share your thoughts about this product (optional)"
        value={comment ?? ""}
        maxLength={MAX_REVIEW_LENGTH}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
      />
      <span className={styles.charCount}>
        {(comment ?? "").length}/{MAX_REVIEW_LENGTH}
      </span>

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
        </button>
        {onCancel && (
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}