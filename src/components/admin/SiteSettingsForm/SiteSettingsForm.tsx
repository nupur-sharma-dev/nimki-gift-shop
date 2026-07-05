"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ui/ImageUpload/ImageUpload";
import {
  ANNOUNCEMENT_BAR_MAX_LENGTH,
  MAX_HERO_IMAGES,
} from "@/services/site-settings.service";
import styles from "./SiteSettingsForm.module.css";

interface Props {
  initialHeroImages: string[];
  initialAnnouncementBar: string | null;
  initialIsStoreOpen: boolean;
}

export default function SiteSettingsForm({
  initialHeroImages,
  initialAnnouncementBar,
  initialIsStoreOpen,
}: Props) {
  const [heroImages, setHeroImages] = useState<string[]>(initialHeroImages);
  const [announcementBar, setAnnouncementBar] = useState(initialAnnouncementBar ?? "");
  const [isStoreOpen, setIsStoreOpen] = useState(initialIsStoreOpen);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (announcementBar.length > ANNOUNCEMENT_BAR_MAX_LENGTH) {
      toast.error(`Announcement bar must be ${ANNOUNCEMENT_BAR_MAX_LENGTH} characters or fewer`);
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroImages,
          announcementBar: announcementBar.trim() || null,
          isStoreOpen,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error ?? "Failed to save site settings");
        return;
      }

      toast.success("Site settings saved");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Hero Images</h2>
        <p className={styles.sectionHint}>
          Up to {MAX_HERO_IMAGES} images shown in rotation on the homepage hero. Empty slots
          fall back to default artwork.
        </p>
        <ImageUpload
          value={heroImages}
          onChange={setHeroImages}
          max={MAX_HERO_IMAGES}
          folder="nimki/site-settings"
          label=""
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Announcement Bar</h2>
        <p className={styles.sectionHint}>
          Shown at the top of every storefront page. Leave blank to hide it.
        </p>
        <textarea
          className={styles.textarea}
          value={announcementBar}
          onChange={(e) => setAnnouncementBar(e.target.value)}
          maxLength={ANNOUNCEMENT_BAR_MAX_LENGTH}
          rows={2}
          placeholder="e.g. Free shipping on orders above Rs. 2000"
        />
        <p className={styles.charCount}>
          {announcementBar.length}/{ANNOUNCEMENT_BAR_MAX_LENGTH}
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Store Status</h2>
        <p className={styles.sectionHint}>
          Informational only for now — does not block checkout or browsing.
        </p>
        <div className={styles.toggleRow}>
          <button
            type="button"
            role="switch"
            aria-checked={isStoreOpen}
            className={`${styles.toggle} ${isStoreOpen ? styles.toggleOn : ""}`}
            onClick={() => setIsStoreOpen((prev) => !prev)}
          >
            <span className={styles.toggleKnob} />
          </button>
          <span className={styles.toggleLabel}>
            {isStoreOpen ? "Store is Open" : "Store is Closed"}
          </span>
        </div>
      </section>

      <div className={styles.actions}>
        <button type="submit" className={styles.saveBtn} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}