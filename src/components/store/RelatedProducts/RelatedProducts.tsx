import type { ProductCard as ProductCardType } from "@/types";
import ProductCard from "../ProductCard/ProductCard";
import styles from "./RelatedProducts.module.css";

interface RelatedProductsProps {
  products: ProductCardType[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>You might also like</h3>
      <div className={styles.scroll}>
        {products.map((product) => (
          <div key={product.id} className={styles.cardWrapper}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}