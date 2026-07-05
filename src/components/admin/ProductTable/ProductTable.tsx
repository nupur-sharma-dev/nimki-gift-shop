"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { ROUTES } from "@/constants";
import styles from "./ProductTable.module.css";

interface ProductTableItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  category: { id: string; name: string } | null;
}

interface ProductTableProps {
  products: ProductTableItem[];
}

export default function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ProductTableItem | null>(null);

  const handleToggleConfirm = async () => {
    if (!confirmTarget) return;

    const target = confirmTarget;
    setConfirmTarget(null);
    setPendingId(target.id);

    try {
      const res = await fetch(`/api/admin/products/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !target.isActive }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Failed to update product status.");
        return;
      }

      toast.success(target.isActive ? "Product deactivated." : "Product reactivated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPendingId(null);
    }
  };

  if (products.length === 0) {
    return <p className={styles.empty}>No products found.</p>;
  }

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className={styles.productCell}>
                    <div className={styles.thumb}>
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className={styles.thumbImg}
                        />
                      )}
                    </div>
                    <span className={styles.productName}>{product.name}</span>
                  </div>
                </td>
                <td>{product.category?.name ?? "—"}</td>
                <td>Rs. {product.price.toLocaleString()}</td>
                <td>{product.stock}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      product.isActive ? styles.badgeActive : styles.badgeInactive
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link href={ROUTES.ADMIN_PRODUCTS_EDIT(product.id)} className={styles.editLink}>
                      Edit
                    </Link>
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      disabled={pendingId === product.id}
                      onClick={() => setConfirmTarget(product)}
                    >
                      {pendingId === product.id
                        ? "Updating…"
                        : product.isActive
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
              {confirmTarget.isActive ? "Deactivate product?" : "Reactivate product?"}
            </h3>
            <p className={styles.dialogText}>
              {confirmTarget.isActive
                ? `"${confirmTarget.name}" will be hidden from the store. You can reactivate it anytime.`
                : `"${confirmTarget.name}" will become visible on the store again.`}
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