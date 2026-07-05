import { getSiteSettings } from "@/services/site-settings.service";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm/SiteSettingsForm";
import styles from "./page.module.css";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Site Settings</h1>
        <p className={styles.subtitle}>
          Manage the homepage hero images, announcement bar, and store status.
        </p>
      </div>

      <SiteSettingsForm
        initialHeroImages={settings.heroImages}
        initialAnnouncementBar={settings.announcementBar}
        initialIsStoreOpen={settings.isStoreOpen}
      />
    </div>
  );
}