"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ROUTES } from "@/constants";
import { getInitials } from "@/utils";
import { isNavLinkActive } from "@/utils/nav";
import styles from "./AccountSidebar.module.css";

interface AccountSidebarProps {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
}

const NAV_ITEMS = [
  { href: ROUTES.ACCOUNT, icon: "bx-user", label: "Overview" },
  { href: ROUTES.ACCOUNT_PROFILE, icon: "bx-edit", label: "Edit Profile" },
  { href: ROUTES.ACCOUNT_ADDRESSES, icon: "bx-map", label: "Addresses" },
  { href: ROUTES.ORDERS, icon: "bx-package", label: "Order History", disabled: true },
];

export default function AccountSidebar({ name, email, image }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <div className={styles.avatar}>
          {image ? (
            <Image
              src={image}
              alt={name ?? "User"}
              className={styles.avatarImg}
              width={80}
              height={80}
              priority
            />
          ) : (
            <span>{getInitials(name)}</span>
          )}
        </div>
        <p className={styles.name}>{name ?? "Account"}</p>
        <p className={styles.email}>{email}</p>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) =>
          item.disabled ? (
            <span key={item.href} className={`${styles.navLink} ${styles.navLinkDisabled}`}>
              <i className={`bx ${item.icon}`} />
              {item.label}
              <span className={styles.soon}>Soon</span>
            </span>
          ) : (
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
          )
        )}
      </nav>

      <button
        type="button"
        className={styles.logoutBtn}
        onClick={() => signOut({ callbackUrl: ROUTES.HOME })}
      >
        <i className="bx bx-log-out" /> Logout
      </button>
    </aside>
  );
}