"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import ProductCard from "@/components/store/ProductCard/ProductCard";
import type { ProductCard as ProductCardType } from "@/types";
import styles from "./GiftFinderForm.module.css";

interface GiftPickResult {
  product: ProductCardType;
  reason: string;
}

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

export default function GiftFinderForm() {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [picks, setPicks] = useState<GiftPickResult[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (description.trim().length < MIN_LENGTH) {
      toast.error(
        `Please describe what you're looking for (at least ${MIN_LENGTH} characters).`
      );
      return;
    }

    setIsLoading(true);
    setPicks(null);

    try {
      const res = await fetch("/api/gift-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const json = await res.json();

      if (!json.success) {
        toast.error(json.error || "Something went wrong.");
        setHasSearched(true);
        return;
      }

      setPicks(json.data.picks);
      setHasSearched(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          placeholder="e.g. A gift for my mom who loves gardening, budget under 2000..."
          value={description}
          maxLength={MAX_LENGTH}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
        <div className={styles.formFooter}>
          <span className={styles.charCount}>
            {description.length}/{MAX_LENGTH}
          </span>
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="bx bx-loader-alt bx-spin" /> Finding gifts...
              </>
            ) : (
              <>
                <i className="bx bx-gift" /> Find Gifts
              </>
            )}
          </button>
        </div>
      </form>

      {hasSearched && !isLoading && (
        <div className={styles.results}>
          {picks && picks.length > 0 ? (
            <div className={styles.grid}>
              {picks.map(({ product, reason }) => (
                <div key={product.id} className={styles.pick}>
                  <ProductCard product={product} />
                  <p className={styles.reason}>
                    <i className="bx bx-bulb" /> {reason}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <i className="bx bx-search-alt" />
              <h4 className={styles.emptyTitle}>No matches found</h4>
              <p className={styles.emptyText}>
                Try describing the recipient, occasion, or budget differently.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}