import Link from "next/link";
import { getDashboardStats, getRecentOrders } from "@/services/admin-dashboard.service";
import { formatCurrency, formatDate } from "@/utils";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, ROUTES } from "@/constants";
import styles from "./page.module.css";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "statusPending",
  CONFIRMED: "statusConfirmed",
  PROCESSING: "statusProcessing",
  SHIPPED: "statusShipped",
  DELIVERED: "statusDelivered",
  CANCELLED: "statusCancelled",
  REFUNDED: "statusRefunded",
};

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(8),
  ]);

  const statCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: "bx-dollar-circle",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: "bx-receipt",
    },
    {
      label: "Active Products",
      value: stats.totalProducts.toString(),
      icon: "bx-package",
    },
    {
      label: "Customers",
      value: stats.totalCustomers.toString(),
      icon: "bx-group",
    },
    {
      label: "Low Stock",
      value: stats.lowStockCount.toString(),
      icon: "bx-error-circle",
      alert: stats.lowStockCount > 0,
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviewsCount.toString(),
      icon: "bx-star",
      alert: stats.pendingReviewsCount > 0,
    },
  ];

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.statsGrid}>
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`${styles.statCard} ${card.alert ? styles.statCardAlert : ""}`}
          >
            <div className={styles.statIcon}>
              <i className={`bx ${card.icon}`} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{card.value}</span>
              <span className={styles.statLabel}>{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.recentSection}>
        <div className={styles.recentHeader}>
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <Link href={ROUTES.ADMIN_ORDERS} className={styles.viewAllLink}>
            View All <i className="bx bx-right-arrow-alt" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className={styles.emptyText}>No orders yet.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className={styles.orderNumber}>{order.orderNumber}</td>
                    <td>
                      <div className={styles.customerCell}>
                        <span>{order.customerName ?? "—"}</span>
                        <span className={styles.customerEmail}>
                          {order.customerEmail}
                        </span>
                      </div>
                    </td>
                    <td>
                      {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[STATUS_STYLES[order.status]] ?? ""
                        }`}
                      >
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}