import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAdminCategories } from "@/services/admin-category.service";
import { ROUTES } from "@/constants";
import CategoryTable from "@/components/admin/CategoryTable/CategoryTable";
import Pagination from "@/components/store/Pagination/Pagination";
import styles from "./page.module.css";

interface PageProps {
  searchParams: {
    search?: string;
    status?: string;
    page?: string;
  };
}

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?error=unauthorized");
  }

  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const status = (searchParams.status as "active" | "inactive" | "all") || "all";

  const result = await getAdminCategories({ search, status, page, limit: 20 });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Categories</h1>
          <p className={styles.subtitle}>
            {result.meta.total} categor{result.meta.total !== 1 ? "ies" : "y"} total
          </p>
        </div>
        <Link href={ROUTES.ADMIN_CATEGORIES_NEW} className={styles.newBtn}>
          <i className="bx bx-plus" /> New Category
        </Link>
      </div>

      <form method="get" className={styles.filters}>
        <input
          type="text"
          name="search"
          placeholder="Search by name…"
          defaultValue={search}
          className={styles.searchInput}
        />

        <select name="status" defaultValue={status} className={styles.select}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button type="submit" className={styles.filterBtn}>
          Filter
        </button>
      </form>

      <CategoryTable categories={result.data} />

      <Pagination
        currentPage={result.meta.page}
        totalPages={result.meta.totalPages}
        basePath={ROUTES.ADMIN_CATEGORIES}
      />
    </div>
  );
}