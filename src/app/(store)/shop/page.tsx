import { Suspense } from "react";
import { getProducts, getAllCategoriesWithCounts } from "@/services/product.service";
import ProductGrid from "@/components/store/ProductGrid/ProductGrid";
import FilterSidebar from "@/components/store/FilterSidebar/FilterSidebar";
import SortDropdown from "@/components/store/SortDropdown/SortDropdown";
import Pagination from "@/components/store/Pagination/Pagination";
import EmptyState from "@/components/store/EmptyState/EmptyState";
import { PAGINATION } from "@/constants";
import type { SortOption } from "@/types";
import styles from "./page.module.css";

interface ShopPageProps {
  searchParams: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const limit = PAGINATION.DEFAULT_LIMIT;
  const sort = (searchParams.sort || "newest") as SortOption;

  const filters = {
    categoryId: searchParams.category,
    minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice, 10) : undefined,
    maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice, 10) : undefined,
  };

  const categories = await getAllCategoriesWithCounts();
  const { data: products, meta } = await getProducts({ filters, sort, page, limit });

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.banner}>
          <span className={styles.eyebrow}>Handmade in Nepal</span>
          <h1 className={styles.title}>Shop the Collection</h1>
        </div>

        <div className={styles.toolbarWrap}>
          <div className={styles.toolbar}>
            <Suspense fallback={<span className={styles.skeletonTags}>Loading filters…</span>}>
              <FilterSidebar
                categories={categories}
                selectedCategoryId={filters.categoryId}
                minPrice={filters.minPrice || 0}
                maxPrice={filters.maxPrice || 10000}
              />
            </Suspense>
            <Suspense fallback={<span className={styles.skeletonSort}>Loading…</span>}>
              <SortDropdown currentSort={sort} />
            </Suspense>
          </div>

          <div className={styles.resultsBar}>
            <span className={styles.resultCount}>
              {meta.total > 0 ? (
                <>
                  Showing <strong>{((page - 1) * limit) + 1}</strong>–
                  <strong>{Math.min(page * limit, meta.total)}</strong> of{" "}
                  <strong>{meta.total}</strong> pieces
                </>
              ) : (
                "No pieces found"
              )}
            </span>
          </div>
        </div>

        {products.length === 0 ? (
          <div className={styles.emptyWrapper}>
            <EmptyState />
          </div>
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