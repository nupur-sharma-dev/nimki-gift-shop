import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAllCategoriesWithCounts } from "@/services/product.service";
import ProductForm from "@/components/admin/ProductForm/ProductForm";
import styles from "./page.module.css";

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?error=unauthorized");
  }

  const categories = await getAllCategoriesWithCounts();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>New Product</h1>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}