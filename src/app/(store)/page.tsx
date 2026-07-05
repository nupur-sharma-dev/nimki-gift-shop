import { getSiteSettings } from "@/services/site-settings.service";
import HeroSlideshow from "@/components/store/HeroSlideshow/HeroSlideshow";
import AboutTeaser from "@/components/store/AboutTeaser/AboutTeaser";
import Newsletter from "@/components/store/Newsletter/Newsletter";
import styles from "./page.module.css";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ROUTES, APP_NAME } from "@/constants";

export const metadata: Metadata = buildMetadata({
  title: "Shop All Products",
  description: `Browse handmade jewellery, candles, gift hampers, cards, and personalized gifts at ${APP_NAME}.`,
  path: ROUTES.SHOP,
});

export default async function HomePage() {
  const { heroImages } = await getSiteSettings();

  return (
    <main className={styles.main}>
      <HeroSlideshow heroImages={heroImages} />
      <AboutTeaser />
      <Newsletter />
    </main>
  );
}