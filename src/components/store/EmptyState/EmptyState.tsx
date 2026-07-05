import Link from "next/link";
import styles from "./EmptyState.module.css";

export default function EmptyState() {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>
        <i className="bx bx-gift" />
      </div>
      <h3 className={styles.title}>Nothing here yet</h3>
      <p className={styles.description}>
        No handmade pieces match these filters right now. Try a different
        category or widen the price range.
      </p>
      <Link href="/shop" className={styles.clearBtn}>
        Clear all filters
      </Link>
    </div>
  );
}