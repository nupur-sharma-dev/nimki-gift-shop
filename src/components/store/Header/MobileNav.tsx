"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { ROUTES } from "@/constants";
import { isNavLinkActive } from "@/utils/nav";
import SearchBar from "../SearchBar/SearchBar";
import styles from "./MobileNav.module.css";

interface NavLink {
  label: string;
  href: string;
}

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  currentPath: string | null;
}

export default function MobileNav({
  isOpen,
  onClose,
  navLinks,
  currentPath,
}: MobileNavProps) {
  const { data: session } = useSession();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Menu</span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            <i className="bx bx-x" />
          </button>
        </div>

        <div className={styles.drawerSearch}>
          <SearchBar variant="inline" onNavigate={onClose} />
        </div>

        <nav className={styles.drawerNav}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.drawerLink} ${
                isNavLinkActive(currentPath, link.href) ? styles.drawerLinkActive : ""
              }`}
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.drawerDivider} />

        {session ? (
          <div className={styles.drawerAccount}>
            <Link href={ROUTES.ACCOUNT} className={styles.drawerLink} onClick={onClose}>
              <i className="bx bx-user" /> My Account
            </Link>
            <Link href={ROUTES.ORDERS} className={styles.drawerLink} onClick={onClose}>
              <i className="bx bx-package" /> Order History
            </Link>
            {session.user?.role === "ADMIN" && (
              <Link href={ROUTES.ADMIN} className={styles.drawerLink} onClick={onClose}>
                <i className="bx bx-shield-quarter" /> Admin Dashboard
              </Link>
            )}
            <button
              type="button"
              className={styles.drawerLogout}
              onClick={() => {
                onClose();
                signOut({ callbackUrl: ROUTES.HOME });
              }}
            >
              <i className="bx bx-log-out" /> Logout
            </button>
          </div>
        ) : (
          <div className={styles.drawerAuth}>
            <Link href={ROUTES.LOGIN} className={styles.drawerLoginBtn} onClick={onClose}>
              Login
            </Link>
            <Link
              href={ROUTES.REGISTER}
              className={styles.drawerRegisterBtn}
              onClick={onClose}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}