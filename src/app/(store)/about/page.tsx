import { APP_NAME } from "@/constants";
import styles from "./page.module.css";

export const metadata = {
  title: "About Us",
  description: `Learn the story behind ${APP_NAME}  handmade gifts crafted with care in Nepal.`,
};

export default function AboutPage() {
  return (
    <main className={styles.main}>
      <div className="container container--narrow">
        <p className={styles.eyebrow}>Our Story</p>
        <h1 className={styles.title}>Handmade with heart, rooted in Nepal</h1>
        <p className={styles.paragraph}>
          {APP_NAME} began with a simple belief: gifts mean more when they carry
          the hands and heart of the person who made them. We work with local
          artisans across Nepal to bring handcrafted pieces each one imperfectly
          perfect into homes around the world.
        </p>
        <p className={styles.paragraph}>
          Every purchase supports small-scale makers and traditional
          craftsmanship that might otherwise be lost to mass production.
          We&apos;re just getting started, thank you for being part of it.
        </p>
      </div>
    </main>
  );
}
