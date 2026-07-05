"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CategoryWithCount } from "@/types";
import { ROUTES } from "@/constants";
import styles from "./FilterSidebar.module.css";

interface FilterSidebarProps {
  categories: CategoryWithCount[];
  selectedCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  basePath?: string;
}

export default function FilterSidebar({
  categories,
  selectedCategoryId = "",
  minPrice = 0,
  maxPrice = 10000,
  basePath = "/shop",
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceOpen, setPriceOpen] = useState(false);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  const updateFilters = (params: Record<string, string | undefined>, path: string = basePath) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });
    current.set("page", "1");
    router.push(`${path}?${current.toString()}`);
  };

  // Category switches always resolve against /shop, since a category's own
  // page only exists at its own slug — switching category means leaving
  // this page's URL entirely.
  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === selectedCategoryId) {
      router.push(ROUTES.SHOP);
    } else {
      const current = new URLSearchParams();
      current.set("category", categoryId);
      router.push(`${ROUTES.SHOP}?${current.toString()}`);
    }
  };

  const handleAllClick = () => {
    router.push(ROUTES.SHOP);
  };

  const handlePriceApply = () => {
    updateFilters({
      minPrice: localMinPrice > 0 ? String(localMinPrice) : undefined,
      maxPrice: localMaxPrice < 10000 ? String(localMaxPrice) : undefined,
    });
    setPriceOpen(false);
  };

  const clearFilters = () => router.push(basePath);

  const isPriceActive = minPrice > 0 || maxPrice < 10000;
  const hasActiveFilters = Boolean(selectedCategoryId) || isPriceActive;

  return (
    <div className={styles.bar}>
      <div className={styles.tagRow}>
        <button
          type="button"
          className={`${styles.tag} ${!selectedCategoryId ? styles.tagActive : ""}`}
          onClick={handleAllClick}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`${styles.tag} ${
              selectedCategoryId === category.id ? styles.tagActive : ""
            }`}
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.name}
            <span className={styles.tagCount}>{category.productCount}</span>
          </button>
        ))}
      </div>

      <div className={styles.priceGroup}>
        <button
          type="button"
          className={`${styles.priceTrigger} ${
            isPriceActive ? styles.priceTriggerActive : ""
          }`}
          onClick={() => setPriceOpen((v) => !v)}
        >
          <i className="bx bx-purchase-tag-alt" />
          Price
        </button>

        {priceOpen && (
          <div className={styles.pricePanel}>
            <div className={styles.priceInputs}>
              <div className={styles.priceField}>
                <label htmlFor="minPrice">Min (Rs.)</label>
                <input
                  id="minPrice"
                  type="number"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(Number(e.target.value))}
                  min={0}
                  max={localMaxPrice}
                  className={styles.priceInput}
                />
              </div>
              <span className={styles.priceDash}>—</span>
              <div className={styles.priceField}>
                <label htmlFor="maxPrice">Max (Rs.)</label>
                <input
                  id="maxPrice"
                  type="number"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                  min={localMinPrice}
                  max={10000}
                  className={styles.priceInput}
                />
              </div>
            </div>
            <button type="button" className={styles.applyBtn} onClick={handlePriceApply}>
              Apply Price
            </button>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <button type="button" className={styles.clearLink} onClick={clearFilters}>
          Clear all filters
        </button>
      )}
    </div>
  );
}