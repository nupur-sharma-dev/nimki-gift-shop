"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import styles from "./AddressForm.module.css";

export interface AddressFormValues {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
}

interface AddressFormProps {
  initialData?: Partial<AddressFormValues> & { id?: string };
  onSuccess: () => void;
  onCancel: () => void;
}

const EMPTY: AddressFormValues = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
};

export default function AddressForm({
  initialData,
  onSuccess,
  onCancel,
}: AddressFormProps) {
  const [values, setValues] = useState<AddressFormValues>({
    ...EMPTY,
    ...initialData,
  });
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initialData?.id);

  const update = (field: keyof AddressFormValues) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !values.fullName.trim() ||
      !values.phone.trim() ||
      !values.addressLine1.trim() ||
      !values.city.trim() ||
      !values.state.trim() ||
      !values.postalCode.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const url = isEdit
        ? `/api/account/addresses/${initialData!.id}`
        : "/api/account/addresses";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error ?? "Could not save address.");
        return;
      }

      toast.success(isEdit ? "Address updated." : "Address added.");
      onSuccess();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Label</span>
          <input
            type="text"
            value={values.label}
            onChange={update("label")}
            className={styles.input}
            placeholder="Home, Office..."
            maxLength={30}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Full Name</span>
          <input
            type="text"
            value={values.fullName}
            onChange={update("fullName")}
            className={styles.input}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Phone</span>
          <input
            type="tel"
            value={values.phone}
            onChange={update("phone")}
            className={styles.input}
            required
          />
        </label>

        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span className={styles.fieldLabel}>Address Line 1</span>
          <input
            type="text"
            value={values.addressLine1}
            onChange={update("addressLine1")}
            className={styles.input}
            required
          />
        </label>

        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span className={styles.fieldLabel}>Address Line 2 (optional)</span>
          <input
            type="text"
            value={values.addressLine2}
            onChange={update("addressLine2")}
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>City</span>
          <input
            type="text"
            value={values.city}
            onChange={update("city")}
            className={styles.input}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>State / Province</span>
          <input
            type="text"
            value={values.state}
            onChange={update("state")}
            className={styles.input}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Postal Code</span>
          <input
            type="text"
            value={values.postalCode}
            onChange={update("postalCode")}
            className={styles.input}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Country</span>
          <input
            type="text"
            value="Nepal"
            className={styles.input}
            disabled
            readOnly
          />
        </label>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn} disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Address"}
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}