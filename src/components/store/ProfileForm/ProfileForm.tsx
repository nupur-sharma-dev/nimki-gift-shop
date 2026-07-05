"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ui/ImageUpload/ImageUpload";
import styles from "./ProfileForm.module.css";

interface ProfileFormProps {
  hasPassword: boolean;
}

export default function ProfileForm({ hasPassword }: ProfileFormProps) {
  const { data: session, update } = useSession();

  const [name, setName] = useState(session?.user?.name ?? "");
  const [image, setImage] = useState(session?.user?.image ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const avatarValue = image ? [image] : [];

  const handleAvatarChange = (urls: string[]) => {
    setImage(urls[0] ?? "");
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), image: image || null }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error ?? "Could not update profile.");
        return;
      }

      await update({ name: json.data.name, image: json.data.image });
      toast.success("Profile updated.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error ?? "Could not update password.");
        return;
      }

      toast.success("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <form onSubmit={handleProfileSubmit} className={styles.form}>
          <ImageUpload
            value={avatarValue}
            onChange={handleAvatarChange}
            max={1}
            folder="nimki/avatars"
            label="Avatar"
          />

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
              minLength={2}
              maxLength={80}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <input
              type="email"
              value={session?.user?.email ?? ""}
              className={styles.input}
              disabled
              readOnly
            />
            <span className={styles.fieldHint}>Email cannot be changed yet.</span>
          </label>

          <button type="submit" className={styles.submitBtn} disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      {hasPassword && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className={styles.form}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Current Password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={styles.input}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>New Password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                required
                minLength={8}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Confirm New Password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                required
                minLength={8}
              />
            </label>

            <button type="submit" className={styles.submitBtn} disabled={savingPassword}>
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}