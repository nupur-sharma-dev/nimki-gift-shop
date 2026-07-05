import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAdminProducts } from "@/services/admin-product.service";
import { getAllCategoriesWithCounts } from "@/services/product.service";
import { ROUTES } from "@/constants";
import ProductTable from "@/components/admin/ProductTable/ProductTable";
import Pagination from "@/components/store/Pagination/Pagination";
import styles from "./page.module.css";

interface PageProps {
  searchParams: {
    search?: string;
    categoryId?: string;
    status?: string;
    page?: string;
  };
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?error=unauthorized");
  }

  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const categoryId = searchParams.categoryId || "";
  const status = (searchParams.status as "active" | "inactive" | "all") || "all";

  const [result, categories] = await Promise.all([
    getAdminProducts({ search, categoryId, status, page, limit: 20 }),
    getAllCategoriesWithCounts(),
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>
            {result.meta.total} product{result.meta.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href={ROUTES.ADMIN_PRODUCTS_NEW} className={styles.newBtn}>
          <i className="bx bx-plus" /> New Product
        </Link>
      </div>

      <form method="get" className={styles.filters}>
        <input
          type="text"
          name="search"
          placeholder="Search by name or SKU…"
          defaultValue={search}
          className={styles.searchInput}
        />

        <select name="categoryId" defaultValue={categoryId} className={styles.select}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select name="status" defaultValue={status} className={styles.select}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button type="submit" className={styles.filterBtn}>
          Filter
        </button>
      </form>

      <ProductTable products={result.data} />

      <Pagination
        currentPage={result.meta.page}
        totalPages={result.meta.totalPages}
        basePath={ROUTES.ADMIN_PRODUCTS}
      />
    </div>
  );
}