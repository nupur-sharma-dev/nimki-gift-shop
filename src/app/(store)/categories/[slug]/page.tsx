import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getProducts,
  getAllCategoriesWithCounts,
} from "@/services/product.service";
import ProductGrid from "@/components/store/ProductGrid/ProductGrid";
import FilterSidebar from "@/components/store/FilterSidebar/FilterSidebar";
import SortDropdown from "@/components/store/SortDropdown/SortDropdown";
import Pagination from "@/components/store/Pagination/Pagination";
import EmptyState from "@/components/store/EmptyState/EmptyState";
import { PAGINATION, ROUTES } from "@/constants";
import type { SortOption } from "@/types";
import styles from "./page.module.css";

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);

  if (!category || !category.isActive) {
    notFound();
  }

  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const limit = PAGINATION.DEFAULT_LIMIT;
  const sort = (searchParams.sort || "newest") as SortOption;

  const filters = {
    categoryId: category.id,
    minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice, 10) : undefined,
    maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice, 10) : undefined,
  };

  const allCategories = await getAllCategoriesWithCounts();
  const { data: products, meta } = await getProducts({ filters, sort, page, limit });

  const basePath = ROUTES.CATEGORY(category.slug);

  return (
    <div className={styles.page}>
      <div className="container">
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <ol>
            <li>
              <a href={ROUTES.HOME}>Home</a>
            </li>
            <li>
              <a href={ROUTES.CATEGORIES}>Categories</a>
            </li>
            <li aria-current="page">{category.name}</li>
          </ol>
        </nav>

        <div className={styles.banner}>
          <span className={styles.eyebrow}>Handmade in Nepal</span>
          <h1 className={styles.title}>{category.name}</h1>
          {category.description && (
            <p className={styles.description}>{category.description}</p>
          )}
        </div>

        <div className={styles.toolbarWrap}>
          <div className={styles.toolbar}>
            <Suspense fallback={<span className={styles.skeletonTags}>Loading filters…</span>}>
              <FilterSidebar
                categories={allCategories}
                selectedCategoryId={category.id}
                minPrice={filters.minPrice || 0}
                maxPrice={filters.maxPrice || 10000}
                basePath={basePath}
              />
            </Suspense>
            <Suspense fallback={<span className={styles.skeletonSort}>Loading…</span>}>
              <SortDropdown currentSort={sort} basePath={basePath} />
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