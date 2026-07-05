import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/utils";
import { ROUTES } from "@/constants";
import Link from "next/link";
import styles from "./page.module.css";

export default async function AccountOverviewPage() {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true, createdAt: true, emailVerified: true },
  });

  if (!user) return null;

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Account Overview</h1>

      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>Name</span>
          <span className={styles.value}>{user.name ?? "—"}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Email</span>
          <span className={styles.value}>{user.email}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Email Verified</span>
          <span className={styles.value}>
            {user.emailVerified ? (
              <span className={styles.verified}>
                <i className="bx bx-check-circle" /> Verified
              </span>
            ) : (
              <span className={styles.unverified}>Not verified</span>
            )}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Member Since</span>
          <span className={styles.value}>{formatDate(user.createdAt)}</span>
        </div>
      </div>

      <Link href={ROUTES.ACCOUNT_PROFILE} className={styles.editBtn}>
        <i className="bx bx-edit" /> Edit Profile
      </Link>
    </div>
  );
}