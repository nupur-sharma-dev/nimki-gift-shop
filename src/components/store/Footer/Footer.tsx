import Link from "next/link";
import { APP_NAME, APP_TAGLINE, ROUTES, SOCIAL_LINKS } from "@/constants";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerInner}`}>
        <div className={styles.brandCol}>
          <span className={styles.brandName}>{APP_NAME}</span>
          <p className={styles.brandTagline}>{APP_TAGLINE}</p>
          <div className={styles.socials}>
            <a href={SOCIAL_LINKS.INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="bx bxl-instagram" />
            </a>
            <a href={SOCIAL_LINKS.FACEBOOK} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="bx bxl-facebook" />
            </a>
            <a href={SOCIAL_LINKS.PINTEREST} target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
              <i className="bx bxl-pinterest" />
            </a>
          </div>
        </div>

        <div className={styles.linkCol}>
          <h6 className={styles.colTitle}>Shop</h6>
          <Link href={ROUTES.SHOP}>All Products</Link>
          <Link href={ROUTES.CATEGORIES}>Categories</Link>
        </div>

        <div className={styles.linkCol}>
          <h6 className={styles.colTitle}>Company</h6>
          <Link href={ROUTES.ABOUT}>About Us</Link>
        </div>

        <div className={styles.linkCol}>
          <h6 className={styles.colTitle}>Account</h6>
          <Link href={ROUTES.LOGIN}>Login</Link>
          <Link href={ROUTES.ACCOUNT}>My Account</Link>
          <Link href={ROUTES.ORDERS}>Order History</Link>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>© {year} {APP_NAME}. All rights reserved.</p>
      </div>
    </footer>
  );
}