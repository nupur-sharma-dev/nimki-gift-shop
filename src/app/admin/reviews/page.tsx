import { getAdminReviews, type AdminReviewStatusFilter } from "@/services/admin-review.service";
import { ReviewFilters, ReviewTable } from "@/components/admin/ReviewTable/ReviewTable";
import Pagination from "@/components/store/Pagination/Pagination";
import { PAGINATION } from "@/constants";
import styles from "./page.module.css";

interface AdminReviewsPageProps {
  searchParams: {
    page?: string;
    status?: string;
    search?: string;
  };
}

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  const page = Number(searchParams.page) || PAGINATION.DEFAULT_PAGE;
  const status = (searchParams.status as AdminReviewStatusFilter) || "ALL";
  const search = searchParams.search || "";

  const { data: reviews, meta } = await getAdminReviews({
    page,
    limit: PAGINATION.ADMIN_LIMIT,
    status,
    search,
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reviews</h1>
        <p className={styles.subtitle}>
          Approve or reject customer reviews before they appear on product pages.
        </p>
      </div>

      <ReviewFilters />
      <ReviewTable reviews={reviews} />

      {meta.totalPages > 1 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          basePath="/admin/reviews"
        />
      )}
    </div>
  );
}