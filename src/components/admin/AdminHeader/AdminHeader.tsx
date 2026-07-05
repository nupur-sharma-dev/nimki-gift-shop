"use client";

import { signOut } from "next-auth/react";
import { ROUTES } from "@/constants";
import styles from "./AdminHeader.module.css";

interface AdminHeaderProps {
  name: string | null | undefined;
  email: string | null | undefined;
}

export default function AdminHeader({ name, email }: AdminHeaderProps) {
  return (
    <header className={styles.header}>
      <span className={styles.label}>Admin Panel</span>

      <div className={styles.userArea}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{name ?? "Admin"}</span>
          <span className={styles.userEmail}>{email}</span>
        </div>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={() => signOut({ callbackUrl: ROUTES.HOME })}
        >
          <i className="bx bx-log-out" /> Logout
        </button>
      </div>
    </header>
  );
}