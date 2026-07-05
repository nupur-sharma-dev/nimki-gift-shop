import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getOrderById } from "@/services/order.service";
import { formatCurrency, formatDate } from "@/utils";
import { PAYMENT_METHOD_LABELS, ROUTES } from "@/constants";
import type { ShippingAddress } from "@/types";
import styles from "./page.module.css";
import PurchaseTracker from "@/components/analytics/PurchaseTracker";

export default async function OrderSuccessPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(ROUTES.LOGIN);

  const order = await getOrderById(session.user.id, params.id);
  if (!order) notFound();

  const address = order.shippingSnapshot as unknown as ShippingAddress;

  return (
    <div className={styles.wrapper}>
      <PurchaseTracker
        transactionId={order.orderNumber}
        value={order.total}
        shipping={order.shippingCost}
        items={order.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
        }))}
      />

      <div className={styles.card}>
        <i className="bx bx-check-circle" />
        <h1>Thank you for your order!</h1>
        <p className={styles.orderNumber}>Order #{order.orderNumber}</p>

        <div className={styles.details}>
          <div className={styles.row}>
            <span>Payment Method</span>
            <span>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
          </div>
          <div className={styles.row}>
            <span>Order Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          <div className={styles.row}>
            <span>Order Date</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <p className={styles.note}>
          We&apos;ve received your order and will begin processing it shortly.
          {order.paymentMethod === "CASH_ON_DELIVERY"
            ? " Please keep the exact amount ready for delivery."
            : " Payment confirmation will follow shortly."}
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Order Items</h2>

        <div className={styles.itemsList}>
          {order.items.map((item) => (
            <div key={item.id} className={styles.itemRow}>
              {item.productImage ? (
                <div className={styles.itemImage}>
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    sizes="56px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ) : (
                <div className={styles.itemImageFallback}>
                  <i className="bx bx-gift" />
                </div>
              )}

              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.productName}</span>
                <span className={styles.itemMeta}>
                  Qty {item.quantity} × {formatCurrency(item.price)}
                </span>
              </div>

              <span className={styles.itemTotal}>
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.summaryRows}>
          <div className={styles.row}>
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className={styles.row}>
            <span>Shipping</span>
            <span>{order.shippingCost === 0 ? "Free" : formatCurrency(order.shippingCost)}</span>
          </div>
          <div className={`${styles.row} ${styles.totalRow}`}>
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Delivery Address</h2>
        <div className={styles.addressBlock}>
          <p className={styles.addressName}>{address.fullName}</p>
          <p className={styles.addressLine}>{address.addressLine1}</p>
          {address.addressLine2 && <p className={styles.addressLine}>{address.addressLine2}</p>}
          <p className={styles.addressLine}>
            {address.city}, {address.state} {address.postalCode}
          </p>
          <p className={styles.addressLine}>Nepal</p>
          <p className={styles.addressPhone}>Phone: {address.phone}</p>
        </div>
      </div>

      <Link href={ROUTES.SHOP} className={styles.continueBtn}>
        Continue Shopping
      </Link>
    </div>
  );
}