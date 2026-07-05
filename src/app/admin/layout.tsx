import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader/AdminHeader";
import styles from "./layout.module.css";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Access control is enforced by middleware.ts on /admin/:path*.
  // This session fetch is display-only (name/email in the header).
  const session = await getServerSession(authOptions);

  return (
    <div className={styles.wrapper}>
      <AdminSidebar />
      <div className={styles.main}>
        <AdminHeader name={session?.user?.name} email={session?.user?.email} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}