import Image from "next/image";
import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/services/admin-order.service";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm/OrderStatusForm";
import styles from "./page.module.css";
import { PAYMENT_METHOD_LABELS } from "@/constants";


export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getAdminOrderById(params.id);
  if (!order) notFound();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Order {order.orderNumber}</h1>
        <span className={styles.date}>{new Date(order.createdAt).toLocaleString()}</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Items</h2>
            {order.items.map((item) => (
              <div key={item.id} className={styles.item}>
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  width={48}
                  height={48}
                  className={styles.itemImage}
                />
                <div className={styles.itemInfo}>
                  <div>{item.productName}</div>
                  <div className={styles.itemMeta}>
                    Qty {item.quantity} × NPR {item.price.toLocaleString()}
                  </div>
                </div>
                <div className={styles.itemTotal}>
                  NPR {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
            <div className={styles.totals}>
              <div>
                <span>Subtotal</span>
                <span>NPR {order.subtotal.toLocaleString()}</span>
              </div>
              <div>
                <span>Shipping</span>
                <span>NPR {order.shippingCost.toLocaleString()}</span>
              </div>
              <div className={styles.grandTotal}>
                <span>Total</span>
                <span>NPR {order.total.toLocaleString()}</span>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Shipping Address</h2>
            <p>{order.shippingSnapshot.fullName}</p>
            <p>{order.shippingSnapshot.phone}</p>
            <p>
              {order.shippingSnapshot.addressLine1}
              {order.shippingSnapshot.addressLine2 ? `, ${order.shippingSnapshot.addressLine2}` : ""}
            </p>
            <p>
              {order.shippingSnapshot.city}, {order.shippingSnapshot.state}{" "}
              {order.shippingSnapshot.postalCode}
            </p>
            {order.notes && (
              <>
                <h3 className={styles.notesLabel}>Customer Notes</h3>
                <p>{order.notes}</p>
              </>
            )}
          </section>
        </div>

        <div className={styles.sidebar}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Customer</h2>
            <p>{order.customer.name ?? "—"}</p>
            <p className={styles.muted}>{order.customer.email}</p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Payment</h2>
            <p>{PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
            {order.payment?.esewaRefId && (
              <p className={styles.muted}>Ref: {order.payment.esewaRefId}</p>
            )}
            {order.payment?.paidAt && (
              <p className={styles.muted}>
                Paid: {new Date(order.payment.paidAt).toLocaleString()}
              </p>
            )}
          </section>

          <OrderStatusForm
            orderId={order.id}
            currentStatus={order.status}
            currentPaymentStatus={order.paymentStatus}
            cancelReason={order.cancelReason}
          />
        </div>
      </div>
    </div>
  );
}