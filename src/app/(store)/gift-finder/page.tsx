import GiftFinderForm from "@/components/store/GiftFinderForm/GiftFinderForm";
import styles from "./page.module.css";

export default function GiftFinderPage() {
  return (
    <div className={styles.page}>
      <div className="container container--narrow">
        <div className={styles.hero}>
          <span className={styles.eyebrow}>AI Gift Recommender</span>
          <h1 className={styles.title}>Find the Perfect Gift</h1>
          <p className={styles.subtitle}>
            Tell us who you&apos;re shopping for, and we&apos;ll suggest handmade gifts
            from our catalog that fit.
          </p>
        </div>

        <GiftFinderForm />
      </div>
    </div>
  );
}