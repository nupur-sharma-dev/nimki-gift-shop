"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME, ROUTES } from "@/constants";
import { isNavLinkActive } from "@/utils/nav";
import styles from "./AdminSidebar.module.css";

const NAV_ITEMS = [
  { href: ROUTES.ADMIN, icon: "bx-grid-alt", label: "Dashboard" },
  { href: ROUTES.ADMIN_PRODUCTS, icon: "bx-package", label: "Products" },
  { href: ROUTES.ADMIN_CATEGORIES, icon: "bx-category", label: "Categories" },
  { href: ROUTES.ADMIN_ORDERS, icon: "bx-receipt", label: "Orders" },
  { href: ROUTES.ADMIN_CUSTOMERS, icon: "bx-group", label: "Customers" },
  { href: ROUTES.ADMIN_REVIEWS, icon: "bx-star", label: "Reviews" },
  { href: ROUTES.ADMIN_SETTINGS, icon: "bx-cog", label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMain}>{APP_NAME.split(" ")[0]}</span>
        <span className={styles.brandSub}>Admin</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${
              isNavLinkActive(pathname, item.href) ? styles.navLinkActive : ""
            }`}
          >
            <i className={`bx ${item.icon}`} />
            {item.label}
          </Link>
        ))}
      </nav>

      <Link href={ROUTES.HOME} className={styles.backToStore}>
        <i className="bx bx-arrow-back" /> Back to Store
      </Link>
    </aside>
  );
}