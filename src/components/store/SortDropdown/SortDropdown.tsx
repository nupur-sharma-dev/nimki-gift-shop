"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { SortOption } from "@/types";
import styles from "./SortDropdown.module.css";

interface SortDropdownProps {
  currentSort: SortOption;
  basePath?: string;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

export default function SortDropdown({ currentSort, basePath = "/shop" }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1");
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>Sort by</span>
      <div className={styles.dropdown}>
        <select
          className={styles.select}
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <i className={`bx bx-chevron-down ${styles.icon}`} />
      </div>
    </div>
  );
}