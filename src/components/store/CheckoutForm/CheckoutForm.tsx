"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { formatCurrency } from "@/utils";
import {
  ROUTES,
  SHIPPING_COST,
  FREE_SHIPPING_THRESHOLD,
  ORDER_NOTES_MAX_LENGTH,
  PAYMENT_METHOD_LABELS,
} from "@/constants";
import type { CartSummary } from "@/services/cart.service";
import type { Address } from "@prisma/client";
import styles from "./CheckoutForm.module.css";

interface CheckoutFormProps {
  cart: CartSummary;
  addresses: Address[];
}

type PaymentOption = "ESEWA" | "CASH_ON_DELIVERY";

const ERROR_MESSAGES: Record<string, string> = {
  payment_failed: "Your eSewa payment was not completed.",
  payment_cancelled: "eSewa payment was cancelled.",
  payment_verification_failed: "We couldn't verify your eSewa payment. Please try again.",
  session_expired: "Your checkout session expired. Please try again.",
  order_creation_failed: "Payment succeeded but we couldn't create your order. Please contact support.",
};

export default function CheckoutForm({ cart, addresses }: CheckoutFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ""
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentOption>("CASH_ON_DELIVERY");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error(ERROR_MESSAGES[error] ?? "Something went wrong with your payment.");
    }
  }, [searchParams]);

  const shipping = cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = cart.subtotal + shipping;

  const placeCodOrder = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod: "CASH_ON_DELIVERY",
          notes: notes.trim() || undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error ?? "Could not place order.");
        setSubmitting(false);
        return;
      }

      toast.success("Order placed!");
      router.push(ROUTES.ORDER_SUCCESS(json.data.orderId));
    } catch (error) {
      console.error("[CheckoutForm] COD order failed:", error);
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const startEsewaPayment = async () => {
    try {
      const res = await fetch("/api/checkout/esewa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddressId,
          notes: notes.trim() || undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error ?? "Could not start eSewa payment.");
        setSubmitting(false);
        return;
      }

      const { formUrl, fields } = json.data as { formUrl: string; fields: Record<string, string> };

      const form = document.createElement("form");
      form.method = "POST";
      form.action = formUrl;

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      // Browser is navigating away to eSewa; no need to reset `submitting`.
    } catch (error) {
      console.error("[CheckoutForm] eSewa initiate failed:", error);
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }

    setSubmitting(true);

    if (paymentMethod === "CASH_ON_DELIVERY") {
      await placeCodOrder();
    } else {
      await startEsewaPayment();
    }
  };

  return (
    <div className={styles.layout}>
      <div className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Delivery Address</h2>

          {addresses.length === 0 ? (
            <div className={styles.emptyAddress}>
              <i className="bx bx-map-pin" />
              <p>You don&apos;t have a saved address yet.</p>
              <Link href={ROUTES.ACCOUNT_ADDRESSES} className={styles.addAddressBtn}>
                Add Delivery Address
              </Link>
            </div>
          ) : (
            <div className={styles.addressList}>
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`${styles.addressCard} ${
                    selectedAddressId === address.id ? styles.addressCardActive : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={address.id}
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                  />
                  <div className={styles.addressInfo}>
                    <div className={styles.addressTop}>
                      <span className={styles.addressLabel}>{address.label}</span>
                      {address.isDefault && <span className={styles.defaultTag}>Default</span>}
                    </div>
                    <p className={styles.addressName}>
                      {address.fullName} · {address.phone}
                    </p>
                    <p className={styles.addressLines}>
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ""}, {address.city},{" "}
                      {address.state} {address.postalCode}, Nepal
                    </p>
                  </div>
                </label>
              ))}
              <Link href={ROUTES.ACCOUNT_ADDRESSES} className={styles.manageLink}>
                Manage Addresses
              </Link>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Payment Method</h2>
          <div className={styles.paymentOptions}>
            <label
              className={`${styles.paymentCard} ${
                paymentMethod === "CASH_ON_DELIVERY" ? styles.paymentCardActive : ""
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="CASH_ON_DELIVERY"
                checked={paymentMethod === "CASH_ON_DELIVERY"}
                onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
              />
              <i className="bx bx-money" />
              <div>
                <span className={styles.paymentTitle}>{PAYMENT_METHOD_LABELS.CASH_ON_DELIVERY}</span>
                <span className={styles.paymentDesc}>Pay when your order arrives</span>
              </div>
            </label>

            <label
              className={`${styles.paymentCard} ${
                paymentMethod === "ESEWA" ? styles.paymentCardActive : ""
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="ESEWA"
                checked={paymentMethod === "ESEWA"}
                onChange={() => setPaymentMethod("ESEWA")}
              />
              <i className="bx bx-wallet" />
              <div>
                <span className={styles.paymentTitle}>{PAYMENT_METHOD_LABELS.ESEWA}</span>
                <span className={styles.paymentDesc}>Pay securely with your eSewa account</span>
              </div>
            </label>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Order Notes (Optional)</h2>
          <textarea
            className={styles.notesInput}
            placeholder="Any special instructions for your order..."
            value={notes}
            maxLength={ORDER_NOTES_MAX_LENGTH}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <span className={styles.charCount}>
            {notes.length}/{ORDER_NOTES_MAX_LENGTH}
          </span>
        </section>
      </div>

      <aside className={styles.summary}>
        <h2 className={styles.summaryTitle}>Order Summary</h2>

        <div className={styles.itemsPreview}>
          {cart.items.map((item) => (
            <div key={item.id} className={styles.previewRow}>
              <Image
                src={item.product.images[0] ?? "/images/prod1.png"}
                alt={item.product.name}
                width={48}
                height={48}
                className={styles.previewImage}
              />
              <div className={styles.previewInfo}>
                <span className={styles.previewName}>{item.product.name}</span>
                <span className={styles.previewQty}>Qty: {item.quantity}</span>
              </div>
              <span className={styles.previewPrice}>
                {formatCurrency(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{formatCurrency(cart.subtotal)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
        </div>
        <div className={styles.summaryTotal}>
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <button
          type="button"
          className={styles.placeOrderBtn}
          onClick={handlePlaceOrder}
          disabled={submitting || addresses.length === 0}
        >
          {submitting
            ? paymentMethod === "ESEWA"
              ? "Redirecting to eSewa..."
              : "Placing Order..."
            : "Place Order"}
        </button>
      </aside>
    </div>
  );
}