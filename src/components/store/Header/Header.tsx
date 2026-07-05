"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { APP_NAME, ROUTES } from "@/constants";
import { isNavLinkActive } from "@/utils/nav";
import UserMenu from "./UserMenu";
import MobileNav from "./MobileNav";
import SearchBar from "../SearchBar/SearchBar";
import styles from "./Header.module.css";

interface HeaderProps {
  cartCount: number;
  announcementBar: string | null;
  isStoreOpen: boolean;
}

const NAV_LINKS = [
  { label: "Shop", href: ROUTES.SHOP },
  { label: "Categories", href: ROUTES.CATEGORIES },
  { label: "Gift Finder", href: ROUTES.GIFT_FINDER },
  { label: "About", href: ROUTES.ABOUT },
];

export default function Header({
  cartCount,
  announcementBar,
  isStoreOpen,
}: HeaderProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  

  const showClosedBanner = !isStoreOpen;
  const showAnnouncement = isStoreOpen && !!announcementBar;

  const [logoMain, ...logoRestParts] = APP_NAME.split(" ");
  const logoSub = logoRestParts.join(" ");

  return (
    <>
      {(showClosedBanner || showAnnouncement) && (
        <div
          className={
            showClosedBanner ? styles.bannerClosed : styles.bannerAnnouncement
          }
        >
          <p>
            {showClosedBanner
              ? "We're temporarily not accepting new orders — please check back soon."
              : announcementBar}
          </p>
        </div>
      )}

      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link href={ROUTES.HOME} className={styles.logo}>
            <span className={styles.logoMain}>{logoMain}</span>
            {logoSub && <span className={styles.logoSub}>{logoSub}</span>}
          </Link>

          <nav className={styles.nav} aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${
                  isNavLinkActive(pathname, link.href) ? styles.navLinkActive : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.searchInline}>
            <SearchBar />
          </div>

          <div className={styles.actions}>
            <Link href={ROUTES.CART} className={styles.cartLink} aria-label="Cart">
              <i className="bx bx-cart" />
              {cartCount > 0 && (
                <span className={styles.cartBadge}>
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            <div className={styles.userMenuDesktop}>
              <UserMenu />
            </div>

            <button
              type="button"
              className={styles.hamburger}
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <i className="bx bx-menu" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        navLinks={NAV_LINKS}
        currentPath={pathname}
      />
    </>
  );
}