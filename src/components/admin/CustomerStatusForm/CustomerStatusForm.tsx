"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { UserRole } from "@prisma/client";
import styles from "./CustomerStatusForm.module.css";

interface Props {
  userId: string;
  currentRole: UserRole;
  isActive: boolean;
  isSelf: boolean;
}

export function CustomerStatusForm({ userId, currentRole, isActive, isSelf }: Props) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(currentRole);
  const [saving, setSaving] = useState(false);

  const roleChanged = role !== currentRole;

  async function patchUser(body: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.error ?? "Update failed.");
        return;
      }

      toast.success("Updated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function handleToggleActive() {
    const action = isActive ? "deactivate" : "reactivate";
    const confirmed = window.confirm(`Are you sure you want to ${action} this user?`);
    if (!confirmed) return;
    patchUser({ toggleActive: true });
  }

  function handleRoleSave() {
    const confirmed = window.confirm(
      `Change this user's role to ${role}? This changes their access level immediately.`
    );
    if (!confirmed) return;
    patchUser({ role });
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Manage Access</h2>

      {isSelf && (
        <p className={styles.hint}>
          You cannot change your own role or deactivate your own account.
        </p>
      )}

      <label className={styles.label}>
        Role
        <select
          className={styles.select}
          value={role}
          disabled={isSelf}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </label>
      <button
        className={styles.saveButton}
        onClick={handleRoleSave}
        disabled={isSelf || saving || !roleChanged}
      >
        {saving ? "Saving..." : "Save Role"}
      </button>

      <hr className={styles.divider} />

      <button
        className={isActive ? styles.deactivateButton : styles.activateButton}
        onClick={handleToggleActive}
        disabled={isSelf || saving}
      >
        {isActive ? "Deactivate User" : "Reactivate User"}
      </button>
    </section>
  );
}