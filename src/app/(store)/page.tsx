import { getSiteSettings } from "@/services/site-settings.service";
import HeroSlideshow from "@/components/store/HeroSlideshow/HeroSlideshow";
import AboutTeaser from "@/components/store/AboutTeaser/AboutTeaser";
import Newsletter from "@/components/store/Newsletter/Newsletter";
import styles from "./page.module.css";

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