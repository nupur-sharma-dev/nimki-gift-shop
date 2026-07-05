import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants";
import type { CategoryWithCount } from "@/types";
import styles from "./CategoryCard.module.css";

interface CategoryCardProps {
  category: CategoryWithCount & { image?: string | null };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={ROUTES.CATEGORY(category.slug)} className={styles.card}>
      <div className={styles.imageWrap}>
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className={styles.fallback}>
            <i className="bx bx-gift" />
          </div>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{category.name}</h3>
        <span className={styles.count}>
          {category.productCount} {category.productCount === 1 ? "piece" : "pieces"}
        </span>
      </div>
    </Link>
  );
}