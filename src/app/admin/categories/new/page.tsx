import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import CategoryForm from "@/components/admin/CategoryForm/CategoryForm";
import styles from "./page.module.css";

export default async function NewCategoryPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?error=unauthorized");
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>New Category</h1>
      <CategoryForm mode="create" />
    </div>
  );
}