import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAdminCategoryById } from "@/services/admin-category.service";
import CategoryForm from "@/components/admin/CategoryForm/CategoryForm";
import styles from "./page.module.css";

interface PageProps {
  params: { id: string };
}

export default async function EditCategoryPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?error=unauthorized");
  }

  const category = await getAdminCategoryById(params.id);

  if (!category) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Edit Category</h1>
      <CategoryForm
        mode="edit"
        initialValues={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          sortOrder: category.sortOrder,
        }}
      />
    </div>
  );
}