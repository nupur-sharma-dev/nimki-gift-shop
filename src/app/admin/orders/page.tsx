import { getAdminOrders } from "@/services/admin-order.service";
import { OrderFilters, OrderTable } from "@/components/admin/OrderTable/OrderTable";
import Pagination from "@/components/store/Pagination/Pagination";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import styles from "./page.module.css";

interface Props {
  searchParams: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    page?: string;
  };
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const page = Number(searchParams.page) || 1;

  const result = await getAdminOrders({
    search: searchParams.search,
    status: searchParams.status as OrderStatus | undefined,
    paymentStatus: searchParams.paymentStatus as PaymentStatus | undefined,
    page,
    limit: 10,
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Orders</h1>
        <p className={styles.subtitle}>{result.meta.total} total orders</p>
      </div>

      <OrderFilters
        initialSearch={searchParams.search ?? ""}
        initialStatus={searchParams.status ?? ""}
        initialPaymentStatus={searchParams.paymentStatus ?? ""}
      />

      <OrderTable orders={result.data} />

      <Pagination
        currentPage={result.meta.page}
        totalPages={result.meta.totalPages}
        basePath="/admin/orders"
      />
    </div>
  );
}