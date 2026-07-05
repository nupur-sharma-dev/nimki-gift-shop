import { getAdminUsers } from "@/services/admin-user.service";
import { CustomerFilters, CustomerTable } from "@/components/admin/CustomerTable/CustomerTable";
import Pagination from "@/components/store/Pagination/Pagination";
import type { UserRole } from "@prisma/client";
import styles from "./page.module.css";

interface Props {
  searchParams: {
    search?: string;
    role?: string;
    status?: string;
    page?: string;
  };
}

export default async function AdminCustomersPage({ searchParams }: Props) {
  const page = Number(searchParams.page) || 1;

  const result = await getAdminUsers({
    search: searchParams.search,
    role: searchParams.role as UserRole | undefined,
    status: searchParams.status as "active" | "inactive" | undefined,
    page,
    limit: 10,
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Customers</h1>
        <p className={styles.subtitle}>{result.meta.total} total users</p>
      </div>

      <CustomerFilters
        initialSearch={searchParams.search ?? ""}
        initialRole={searchParams.role ?? ""}
        initialStatus={searchParams.status ?? ""}
      />

      <CustomerTable users={result.data} />

      <Pagination
        currentPage={result.meta.page}
        totalPages={result.meta.totalPages}
        basePath="/admin/customers"
      />
    </div>
  );
}