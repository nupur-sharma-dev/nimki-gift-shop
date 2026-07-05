"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import AddressForm, { AddressFormValues } from "@/components/store/AddressForm/AddressForm";
import styles from "./AddressList.module.css";

interface Address extends AddressFormValues {
  id: string;
  isDefault: boolean;
}

interface AddressListProps {
  initialAddresses: Address[];
}

const MAX_ADDRESSES = 5;

export default function AddressList({ initialAddresses }: AddressListProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [mode, setMode] = useState<"idle" | "adding" | "editing">("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const res = await fetch("/api/account/addresses");
      const json = await res.json();
      if (json.success) {
        setAddresses(json.data);
      }
    } catch {
      // silent — list just won't refresh
    }
    setMode("idle");
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error ?? "Could not delete address.");
        return;
      }
      toast.success("Address deleted.");
      await refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    try {
      const res = await fetch(`/api/account/addresses/${id}/default`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error ?? "Could not set default address.");
        return;
      }
      await refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSettingDefaultId(null);
    }
  };

  const atCap = addresses.length >= MAX_ADDRESSES;

  return (
    <div className={styles.wrapper}>
      {addresses.length === 0 && mode === "idle" && (
        <div className={styles.empty}>
          <i className="bx bx-map-pin" />
          <p>You haven&apos;t saved any addresses yet.</p>
        </div>
      )}

      {addresses.length > 0 && (
        <div className={styles.grid}>
          {addresses.map((addr) =>
            editingId === addr.id ? (
              <div key={addr.id} className={`${styles.card} ${styles.cardEditing}`}>
                <AddressForm
                  initialData={addr}
                  onSuccess={refresh}
                  onCancel={() => {
                    setMode("idle");
                    setEditingId(null);
                  }}
                />
              </div>
            ) : (
              <div key={addr.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.label}>{addr.label}</span>
                  {addr.isDefault && (
                    <span className={styles.defaultBadge}>Default</span>
                  )}
                </div>
                <p className={styles.fullName}>{addr.fullName}</p>
                <p className={styles.detail}>{addr.phone}</p>
                <p className={styles.detail}>
                  {addr.addressLine1}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                </p>
                <p className={styles.detail}>
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p className={styles.detail}>Nepal</p>

                <div className={styles.cardActions}>
                  {!addr.isDefault && (
                    <button
                      type="button"
                      className={styles.linkBtn}
                      onClick={() => handleSetDefault(addr.id)}
                      disabled={settingDefaultId === addr.id}
                    >
                      {settingDefaultId === addr.id ? "Setting..." : "Set Default"}
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => {
                      setMode("editing");
                      setEditingId(addr.id);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`${styles.linkBtn} ${styles.linkBtnDanger}`}
                    onClick={() => handleDelete(addr.id)}
                    disabled={deletingId === addr.id}
                  >
                    {deletingId === addr.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {mode === "adding" && (
        <div className={`${styles.card} ${styles.cardEditing}`}>
          <h2 className={styles.addTitle}>Add New Address</h2>
          <AddressForm onSuccess={refresh} onCancel={() => setMode("idle")} />
        </div>
      )}

      {mode === "idle" && (
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => setMode("adding")}
          disabled={atCap}
        >
          <i className="bx bx-plus" />
          {atCap ? `Maximum of ${MAX_ADDRESSES} addresses reached` : "Add New Address"}
        </button>
      )}
    </div>
  );
}