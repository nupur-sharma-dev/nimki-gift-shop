import { getAllCategoriesWithCounts } from "@/services/product.service";
import CategoryCard from "@/components/store/CategoryCard/CategoryCard";
import styles from "./page.module.css";

export default async function CategoriesPage() {
  const categories = await getAllCategoriesWithCounts();

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.banner}>
          <span className={styles.eyebrow}>Handmade in Nepal</span>
          <h1 className={styles.title}>Browse by Category</h1>
        </div>

        {categories.length === 0 ? (
          <p className={styles.empty}>No categories available right now.</p>
        ) : (
          <div className={styles.grid}>
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}