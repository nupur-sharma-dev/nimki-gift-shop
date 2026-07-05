import { Suspense } from "react";
import { getProducts } from "@/services/product.service";
import ProductGrid from "@/components/store/ProductGrid/ProductGrid";
import Pagination from "@/components/store/Pagination/Pagination";
import EmptyState from "@/components/store/EmptyState/EmptyState";
import { PAGINATION } from "@/constants";
import type { SortOption } from "@/types";
import styles from "./page.module.css";

interface SearchPageProps {
  searchParams: {
    q?: string;
    sort?: string;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = (searchParams.q || "").trim();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const limit = PAGINATION.DEFAULT_LIMIT;
  const sort = (searchParams.sort || "newest") as SortOption;

  if (!q) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.banner}>
            <h1 className={styles.title}>Search</h1>
            <p className={styles.subtitle}>
              Type something in the search bar above to find products.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { data: products, meta } = await getProducts({
    filters: { search: q },
    sort,
    page,
    limit,
  });

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.banner}>
          <h1 className={styles.title}>Search results for &quot;{q}&quot;</h1>
          <p className={styles.subtitle}>
            {meta.total} {meta.total === 1 ? "result" : "results"} found
          </p>
        </div>

        {products.length === 0 ? (
          <Suspense fallback={null}>
            <div className={styles.emptyWrapper}>
              <EmptyState />
            </div>
          </Suspense>
        ) : (
          <>
            <ProductGrid products={products} />
            <Pagination currentPage={page} totalPages={meta.totalPages} />
          </>
        )}
      </div>
    </div>
  );
}