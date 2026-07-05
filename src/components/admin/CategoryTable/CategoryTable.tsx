"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { ROUTES } from "@/constants";
import styles from "./CategoryTable.module.css";

interface CategoryTableItem {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
}

interface CategoryTableProps {
  categories: CategoryTableItem[];
}

export default function CategoryTable({ categories }: CategoryTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<CategoryTableItem | null>(null);

  const handleToggleConfirm = async () => {
    if (!confirmTarget) return;

    const target = confirmTarget;
    setConfirmTarget(null);
    setPendingId(target.id);

    try {
      const res = await fetch(`/api/admin/categories/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !target.isActive }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Failed to update category status.");
        return;
      }

      toast.success(target.isActive ? "Category deactivated." : "Category reactivated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPendingId(null);
    }
  };

  if (categories.length === 0) {
    return <p className={styles.empty}>No categories found.</p>;
  }

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Category</th>
              <th>Slug</th>
              <th>Products</th>
              <th>Sort Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>
                  <div className={styles.categoryCell}>
                    <div className={styles.thumb}>
                      {category.image && (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          sizes="48px"
                          className={styles.thumbImg}
                        />
                      )}
                    </div>
                    <span className={styles.categoryName}>{category.name}</span>
                  </div>
                </td>
                <td className={styles.slugCell}>{category.slug}</td>
                <td>{category.productCount}</td>
                <td>{category.sortOrder}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      category.isActive ? styles.badgeActive : styles.badgeInactive
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link
                      href={ROUTES.ADMIN_CATEGORIES_EDIT(category.id)}
                      className={styles.editLink}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      disabled={pendingId === category.id}
                      onClick={() => setConfirmTarget(category)}
                    >
                      {pendingId === category.id
                        ? "Updating…"
                        : category.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmTarget && (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.dialog}>
            <h3 className={styles.dialogTitle}>
              {confirmTarget.isActive ? "Deactivate category?" : "Reactivate category?"}
            </h3>
            <p className={styles.dialogText}>
              {confirmTarget.isActive
                ? `"${confirmTarget.name}" will be hidden from the storefront. Its ${confirmTarget.productCount} product${confirmTarget.productCount !== 1 ? "s" : ""} will not be affected. You can reactivate anytime.`
                : `"${confirmTarget.name}" will become visible on the storefront again.`}
            </p>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.dialogCancel} onClick={() => setConfirmTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={confirmTarget.isActive ? styles.dialogConfirmDanger : styles.dialogConfirm}
                onClick={handleToggleConfirm}
              >
                {confirmTarget.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}