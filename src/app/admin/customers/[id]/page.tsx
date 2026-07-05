import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminUserById } from "@/services/admin-user.service";
import { CustomerStatusForm } from "@/components/admin/CustomerStatusForm/CustomerStatusForm";
import { ROUTES } from "@/constants";
import Link from "next/link";
import styles from "./page.module.css";

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = await getAdminUserById(params.id);
  if (!user) notFound();

  const isSelf = session?.user.id === user.id;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{user.name ?? user.email}</h1>
        <span className={styles.joined}>
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Profile</h2>
            <p>{user.email}</p>
            <p className={styles.muted}>
              {user.emailVerified ? "Email verified" : "Email not verified"}
            </p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Activity</h2>
            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{user.orderCount}</span>
                <span className={styles.statLabel}>Orders</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>NPR {user.totalSpent.toLocaleString()}</span>
                <span className={styles.statLabel}>Total Spent (Paid)</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{user.reviewCount}</span>
                <span className={styles.statLabel}>Reviews</span>
              </div>
            </div>
            <Link
              href={`${ROUTES.ADMIN_ORDERS}?search=${encodeURIComponent(user.email)}`}
              className={styles.link}
            >
              View this customer&apos;s orders →
            </Link>
          </section>
        </div>

        <div className={styles.sidebar}>
          <CustomerStatusForm
            userId={user.id}
            currentRole={user.role}
            isActive={user.isActive}
            isSelf={isSelf}
          />
        </div>
      </div>
    </div>
  );
}