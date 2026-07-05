import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAdminProductById } from "@/services/admin-product.service";
import { getAllCategoriesWithCounts } from "@/services/product.service";
import ProductForm from "@/components/admin/ProductForm/ProductForm";
import styles from "./page.module.css";

interface PageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?error=unauthorized");
  }

  const [product, categories] = await Promise.all([
    getAdminProductById(params.id),
    getAllCategoriesWithCounts(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Edit Product</h1>
      <ProductForm
        mode="edit"
        categories={categories}
        initialValues={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          stock: product.stock,
          sku: product.sku,
          images: product.images,
          categoryId: product.categoryId,
          isFeatured: product.isFeatured,
        }}
      />
    </div>
  );
}