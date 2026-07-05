"use client";
import { ROUTES } from "@/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import type { AdminUserListItem } from "@/services/admin-user.service";
import styles from "./CustomerTable.module.css";
interface CustomerFiltersProps {
  initialSearch: string;
  initialRole: string;
  initialStatus: string;
}

export function CustomerFilters({
  initialSearch,
  initialRole,
  initialStatus,
}: CustomerFiltersProps) {
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
    router.push(`/admin/customers?${params.toString()}`);
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
          placeholder="Search name or email..."
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
        value={initialRole}
        onChange={(e) => updateParam("role", e.target.value)}
      >
        <option value="">All Roles</option>
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>

      <select
        className={styles.select}
        value={initialStatus}
        onChange={(e) => updateParam("status", e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
}

interface CustomerTableProps {
  users: AdminUserListItem[];
}

export function CustomerTable({ users }: CustomerTableProps) {
  if (users.length === 0) {
    return <div className={styles.empty}>No users found.</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name ?? "—"}</td>
              <td>{user.email}</td>
              <td>
                <span
                  className={`${styles.badge} ${
                    user.role === "ADMIN" ? styles.badgeInfo : styles.badgeNeutral
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td>
                <span
                  className={`${styles.badge} ${
                    user.isActive ? styles.badgeSuccess : styles.badgeDanger
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <Link href={ROUTES.ADMIN_CUSTOMERS_DETAIL(user.id)} className={styles.viewLink}>
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