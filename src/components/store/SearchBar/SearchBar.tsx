"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ROUTES } from "@/constants";
import { formatCurrency } from "@/utils";
import styles from "./SearchBar.module.css";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  categoryName: string | null;
}

interface SearchBarProps {
  variant?: "dropdown" | "inline";
  onNavigate?: () => void;
}

export default function SearchBar({ variant = "dropdown", onNavigate }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const runSearch = useCallback(async (value: string) => {
    if (abortRef.current) abortRef.current.abort();

    if (value.trim().length < 2) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setResults([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 300);
  };

  const goToResults = (q: string) => {
    if (!q.trim()) return;
    setOpen(false);
    onNavigate?.();
    router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(q.trim())}`);
  };

  const goToProduct = (slug: string) => {
    setOpen(false);
    onNavigate?.();
    router.push(`/shop/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        goToProduct(results[activeIndex].slug);
      } else {
        goToResults(query);
      }
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  };

  const showPanel = open && query.trim().length >= 2;

  return (
    <div
      ref={wrapRef}
      className={variant === "inline" ? styles.wrapInline : styles.wrap}
    >
      <div className={styles.inputBox}>
        <i className="bx bx-search" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search for gifts..."
          className={styles.input}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search products"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => {
              setQuery("");
              setResults([]);
              setTotal(0);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <i className="bx bx-x" />
          </button>
        )}
      </div>

      {showPanel && (
        <div className={styles.panel}>
          {loading ? (
            <div className={styles.statusRow}>Searching...</div>
          ) : results.length === 0 ? (
            <div className={styles.statusRow}>
              No results for &quot;{query}&quot;
            </div>
          ) : (
            <>
              <ul className={styles.resultsList}>
                {results.map((result, index) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      className={`${styles.resultRow} ${
                        index === activeIndex ? styles.resultRowActive : ""
                      }`}
                      onClick={() => goToProduct(result.slug)}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <span className={styles.resultThumb}>
                        {result.image ? (
                          <Image
                            src={result.image}
                            alt={result.name}
                            fill
                            sizes="44px"
                            className={styles.resultImage}
                          />
                        ) : (
                          <i className="bx bx-gift" />
                        )}
                      </span>
                      <span className={styles.resultInfo}>
                        <span className={styles.resultName}>{result.name}</span>
                        {result.categoryName && (
                          <span className={styles.resultCategory}>
                            {result.categoryName}
                          </span>
                        )}
                      </span>
                      <span className={styles.resultPrice}>
                        {formatCurrency(result.price)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={styles.viewAllBtn}
                onClick={() => goToResults(query)}
              >
                View all {total} result{total !== 1 ? "s" : ""} for &quot;{query}&quot;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}