"use client";

import Link from "next/link";
import Image from "next/image";
import { formatCurrency, calculateDiscount } from "@/utils";
import { ROUTES } from "@/constants";
import { useCart } from "@/context/CartContext";
import { trackAddToCart } from "@/lib/gtag";
import type { ProductCard } from "@/types";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: ProductCard;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, loading } = useCart();

  const discount = product.comparePrice
    ? calculateDiscount(product.price, product.comparePrice)
    : 0;

  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : "/images/prod1.png";

  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, 1);
    trackAddToCart({
      item_id: product.id,
      item_name: product.name,
      item_category: product.category?.name,
      price: product.price,
      quantity: 1,
    });
  };

  return (
    <Link href={ROUTES.PRODUCT(product.slug)} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={imageUrl}
          alt={product.name}
          width={400}
          height={400}
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {discount > 0 && (
          <span className={styles.discountBadge}>-{discount}%</span>
        )}
        {isLowStock && (
          <span className={styles.lowStockBadge}>Low Stock</span>
        )}
        {product.stock === 0 && (
          <span className={styles.soldOutBadge}>Sold Out</span>
        )}
      </div>

      <div className={styles.content}>
        {product.category && (
          <span className={styles.category}>{product.category.name}</span>
        )}

        <h3 className={styles.name}>{product.name}</h3>

        <div className={styles.rating}>
          {product.averageRating && product.totalReviews && product.totalReviews > 0 ? (
            <>
              <span className={styles.stars}>
                {"★".repeat(Math.floor(product.averageRating))}
                {product.averageRating % 1 >= 0.5 && "★"}
                {"☆".repeat(5 - Math.ceil(product.averageRating))}
              </span>
              <span className={styles.reviewCount}>
                ({product.totalReviews})
              </span>
            </>
          ) : (
            <span className={styles.noReviews}>No reviews yet</span>
          )}
        </div>

        <div className={styles.pricing}>
          <span className={styles.currentPrice}>
            {formatCurrency(product.price)}
          </span>
          {product.comparePrice && (
            <span className={styles.comparePrice}>
              {formatCurrency(product.comparePrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          className={styles.addToCartBtn}
          onClick={handleAddToCart}
          disabled={product.stock === 0 || loading}
        >
          <i className="bx bx-cart-add" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}
export { ProductCard };