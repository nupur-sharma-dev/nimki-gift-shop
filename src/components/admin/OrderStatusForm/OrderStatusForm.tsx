"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import styles from "./OrderStatusForm.module.css";
import { ORDER_STATUS_LABELS } from "@/constants";
const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["PENDING", "PAID", "FAILED", "REFUNDED"];

const TERMINAL_STATUSES: OrderStatus[] = ["CANCELLED", "REFUNDED"];

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
  currentPaymentStatus: PaymentStatus;
  cancelReason: string | null;
}

export function OrderStatusForm({
  orderId,
  currentStatus,
  currentPaymentStatus,
  cancelReason,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(currentPaymentStatus);
  const [reason, setReason] = useState(cancelReason ?? "");
  const [saving, setSaving] = useState(false);

  const statusLocked = TERMINAL_STATUSES.includes(currentStatus);
  const paymentLocked = currentPaymentStatus === "REFUNDED";
  const statusChanged = status !== currentStatus;
  const paymentChanged = paymentStatus !== currentPaymentStatus;

  async function handleSave() {
    if (status === "CANCELLED" && !reason.trim()) {
      toast.error("Please provide a cancellation reason.");
      return;
    }

    const confirmed = window.confirm(
      "Save these order changes? This may update stock levels and cannot always be undone."
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusChanged ? status : undefined,
          paymentStatus: paymentChanged ? paymentStatus : undefined,
          cancelReason: status === "CANCELLED" ? reason.trim() : undefined,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.error ?? "Update failed.");
        return;
      }

      toast.success("Order updated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Manage Order</h2>

      <label className={styles.label}>
        Order Status
        <select
          className={styles.select}
          value={status}
          disabled={statusLocked}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
      {statusLocked && (
        <p className={styles.hint}>This order is {currentStatus.toLowerCase()} and locked.</p>
      )}

      {status === "CANCELLED" && !statusLocked && (
        <label className={styles.label}>
          Cancellation Reason
          <textarea
            className={styles.textarea}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this order being cancelled?"
            rows={3}
          />
        </label>
      )}

      <label className={styles.label}>
        Payment Status
        <select
          className={styles.select}
          value={paymentStatus}
          disabled={paymentLocked}
          onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
        >
          {PAYMENT_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      {paymentLocked && <p className={styles.hint}>Payment already refunded and locked.</p>}

      <button
        className={styles.saveButton}
        onClick={handleSave}
        disabled={saving || (!statusChanged && !paymentChanged)}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </section>
  );
}