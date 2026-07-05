"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils";
import { ROUTES, SHIPPING_COST, FREE_SHIPPING_THRESHOLD, MAX_CART_QUANTITY } from "@/constants";

import styles from "./page.module.css";

export default function CartPage() {
  const { items, subtotal, updateItem, removeItem, loading } = useCart();

  if (items.length === 0) {
      return (
        <div className={styles.wrapper}>
          <div className={styles.emptyState}>
            <i className="bx bx-cart" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven&apos;t added anything yet.</p>
            <Link href={ROUTES.SHOP} className={styles.checkoutBtn}>
              Continue Shopping
            </Link>
          </div>
        </div>
      );
    }
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Your Cart</h1>

      <div className={styles.layout}>
        <div className={styles.items}>
          {items.map((item) => (
            <div key={item.id} className={styles.row}>
              <Link href={ROUTES.PRODUCT(item.product.slug)} className={styles.imageLink}>
                <Image
                  src={item.product.images[0] ?? "/images/prod1.png"}
                  alt={item.product.name}
                  width={96}
                  height={96}
                  className={styles.image}
                />
              </Link>

              <div className={styles.info}>
                <Link href={ROUTES.PRODUCT(item.product.slug)} className={styles.name}>
                  {item.product.name}
                </Link>
                <span className={styles.price}>{formatCurrency(item.product.price)}</span>
                {item.quantity > item.product.stock && (
                  <span className={styles.stockWarning}>
                    Only {item.product.stock} left in stock
                  </span>
                )}
              </div>

              <div className={styles.qtyControls}>
                <button
                  type="button"
                  onClick={() => updateItem(item.productId, item.quantity - 1)}
                  disabled={loading}
                  aria-label="Decrease quantity"
                >
                  <i className="bx bx-minus" />
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateItem(item.productId, item.quantity + 1)}
                  disabled={loading || item.quantity >= Math.min(MAX_CART_QUANTITY, item.product.stock)}
                  aria-label="Increase quantity"
                >
                  <i className="bx bx-plus" />
                </button>
              </div>

              <span className={styles.lineTotal}>
                {formatCurrency(item.product.price * item.quantity)}
              </span>

              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeItem(item.productId)}
                disabled={loading}
                aria-label="Remove item"
              >
                <i className="bx bx-trash" />
              </button>
            </div>
          ))}
        </div>

        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
          </div>
          {shipping > 0 && (
            <p className={styles.freeShippingNote}>
              Add {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
            </p>
          )}
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Link href={ROUTES.CHECKOUT} className={styles.checkoutBtn}>
            Proceed to Checkout
          </Link>
          <Link href={ROUTES.SHOP} className={styles.continueLink}>
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}