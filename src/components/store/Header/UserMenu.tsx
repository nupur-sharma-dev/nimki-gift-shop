"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/constants";
import styles from "./UserMenu.module.css";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return <div className={styles.skeleton} />;
  }

  if (!session) {
    return (
      <div className={styles.guestActions}>
        <Link href={ROUTES.LOGIN} className={styles.loginLink}>
          Login
        </Link>
        <Link href={ROUTES.REGISTER} className={styles.registerBtn}>
          Sign Up
        </Link>
      </div>
    );
  }

  const initial =
    session.user?.name?.charAt(0)?.toUpperCase() ??
    session.user?.email?.charAt(0)?.toUpperCase() ??
    "U";

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <button
        type="button"
        className={styles.avatarBtn}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className={styles.avatar}>{initial}</span>
        <i
          className={`bx bx-chevron-down ${styles.chevron} ${
            open ? styles.chevronOpen : ""
          }`}
        />
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <p className={styles.dropdownName}>
              {session.user?.name ?? "Account"}
            </p>
            <p className={styles.dropdownEmail}>{session.user?.email}</p>
          </div>

          <Link
            href={ROUTES.ACCOUNT}
            className={styles.dropdownLink}
            onClick={() => setOpen(false)}
          >
            <i className="bx bx-user" /> My Account
          </Link>
          <Link
            href={ROUTES.ORDERS}
            className={styles.dropdownLink}
            onClick={() => setOpen(false)}
          >
            <i className="bx bx-package" /> Order History
          </Link>
          {session.user?.role === "ADMIN" && (
            <Link
              href={ROUTES.ADMIN}
              className={styles.dropdownLink}
              onClick={() => setOpen(false)}
            >
              <i className="bx bx-shield-quarter" /> Admin Dashboard
            </Link>
          )}

          <button
            type="button"
            className={styles.dropdownLogout}
            onClick={() => signOut({ callbackUrl: ROUTES.HOME })}
          >
            <i className="bx bx-log-out" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}