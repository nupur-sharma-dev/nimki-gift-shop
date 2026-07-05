"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { ROUTES } from "@/constants";
import type { AdminReviewListItem } from "@/services/admin-review.service";
import styles from "./ReviewTable.module.css";

// ── Filters ────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
];

export function ReviewFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", search.trim());
  };

  return (
    <div className={styles.filters}>
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <i className="bx bx-search" />
        <input
          type="text"
          placeholder="Search by product or reviewer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </form>

      <select
        value={searchParams.get("status") ?? "ALL"}
        onChange={(e) => updateParam("status", e.target.value)}
        className={styles.statusSelect}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Table ──────────────────────────────────────────────────────────────

interface ReviewTableProps {
  reviews: AdminReviewListItem[];
}

export function ReviewTable({ reviews }: ReviewTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "PATCH" });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Failed to approve review.");
        return;
      }
      toast.success("Review approved.");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPendingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Failed to reject review.");
        return;
      }
      toast.success("Review rejected and removed.");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPendingId(null);
      setConfirmRejectId(null);
    }
  };

  if (reviews.length === 0) {
    return <p className={styles.empty}>No reviews found.</p>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Reviewer</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td>
                <a
                  href={ROUTES.PRODUCT(review.product.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.productCell}
                >
                  {review.product.images[0] ? (
                    <Image
                      src={review.product.images[0]}
                      alt={review.product.name}
                      width={40}
                      height={40}
                      className={styles.thumbnail}
                    />
                  ) : (
                    <div className={styles.thumbnailPlaceholder}>
                      <i className="bx bx-image" />
                    </div>
                  )}
                  <span>{review.product.name}</span>
                </a>
              </td>
              <td>
                <div className={styles.reviewer}>
                  <span>{review.user.name || "—"}</span>
                  <span className={styles.reviewerEmail}>{review.user.email}</span>
                </div>
              </td>
              <td>
                <span className={styles.rating}>
                  {review.rating} <i className="bx bxs-star" />
                </span>
              </td>
              <td className={styles.commentCell}>
                {review.comment ? (
                  review.comment.length > 80
                    ? `${review.comment.slice(0, 80)}...`
                    : review.comment
                ) : (
                  <span className={styles.noComment}>No comment</span>
                )}
              </td>
              <td>
                <span
                  className={`${styles.badge} ${
                    review.isApproved ? styles.badgeApproved : styles.badgePending
                  }`}
                >
                  {review.isApproved ? "Approved" : "Pending"}
                </span>
              </td>
              <td>{new Date(review.createdAt).toLocaleDateString()}</td>
              <td>
                <div className={styles.actions}>
                  {!review.isApproved && (
                    <button
                      type="button"
                      onClick={() => handleApprove(review.id)}
                      disabled={pendingId === review.id}
                      className={styles.approveBtn}
                    >
                      <i className="bx bx-check" /> Approve
                    </button>
                  )}

                  {confirmRejectId === review.id ? (
                    <div className={styles.confirmGroup}>
                      <span>Delete permanently?</span>
                      <button
                        type="button"
                        onClick={() => handleReject(review.id)}
                        disabled={pendingId === review.id}
                        className={styles.confirmYes}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRejectId(null)}
                        className={styles.confirmNo}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmRejectId(review.id)}
                      disabled={pendingId === review.id}
                      className={styles.rejectBtn}
                    >
                      <i className="bx bx-trash" /> Reject
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}