"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import type { AdminOrderListItem } from "@/services/admin-order.service";
import styles from "./OrderTable.module.css";
import { PAYMENT_METHOD_LABELS, ORDER_STATUS_LABELS } from "@/constants";
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


function statusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "DELIVERED":
      return styles.badgeSuccess;
    case "CANCELLED":
    case "REFUNDED":
      return styles.badgeDanger;
    case "PENDING":
      return styles.badgeWarning;
    default:
      return styles.badgeInfo;
  }
}

function paymentBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case "PAID":
      return styles.badgeSuccess;
    case "FAILED":
    case "REFUNDED":
      return styles.badgeDanger;
    default:
      return styles.badgeWarning;
  }
}

interface OrderFiltersProps {
  initialSearch: string;
  initialStatus: string;
  initialPaymentStatus: string;
}

export function OrderFilters({
  initialSearch,
  initialStatus,
  initialPaymentStatus,
}: OrderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/admin/orders?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("search", search.trim());
  }

  return (
    <div className={styles.filters}>
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Search order # or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          <i className="bx bx-search" />
        </button>
      </form>

      <select
        className={styles.select}
        value={initialStatus}
        onChange={(e) => updateParam("status", e.target.value)}
      >
        <option value="">All Statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={initialPaymentStatus}
        onChange={(e) => updateParam("paymentStatus", e.target.value)}
      >
        <option value="">All Payment Statuses</option>
        {PAYMENT_STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

interface OrderTableProps {
  orders: AdminOrderListItem[];
}

export function OrderTable({ orders }: OrderTableProps) {
  if (orders.length === 0) {
    return <div className={styles.empty}>No orders found.</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className={styles.orderNumber}>{order.orderNumber}</td>
              <td>
                <div>{order.customerName}</div>
                <div className={styles.customerEmail}>{order.customerEmail}</div>
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>{PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</td>
              <td>
                <span className={`${styles.badge} ${statusBadgeClass(order.status)}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </td>
              <td>
                <span className={`${styles.badge} ${paymentBadgeClass(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </td>
              <td>NPR {order.total.toLocaleString()}</td>
              <td>
                <Link href={`/admin/orders/${order.id}`} className={styles.viewLink}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}