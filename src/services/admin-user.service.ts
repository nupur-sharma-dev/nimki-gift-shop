import { prisma } from "@/lib/prisma";
import type { UserRole, Prisma } from "@prisma/client";
import type { PaginatedResponse } from "@/types";

export interface AdminUserListItem {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export interface AdminUserDetail {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  isActive: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  orderCount: number;
  totalSpent: number;
  reviewCount: number;
}

interface GetAdminUsersParams {
  search?: string;
  role?: UserRole;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}

export async function getAdminUsers({
  search,
  role,
  status,
  page = 1,
  limit = 10,
}: GetAdminUsersParams): Promise<PaginatedResponse<AdminUserListItem>> {
  const where: Prisma.UserWhereInput = { role: role ?? undefined };

  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  if (search?.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export async function getAdminUserById(id: string): Promise<AdminUserDetail | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  const [orderCount, paidOrders, reviewCount] = await Promise.all([
    prisma.order.count({ where: { userId: id } }),
    prisma.order.findMany({
      where: { userId: id, paymentStatus: "PAID" },
      select: { total: true },
    }),
    prisma.review.count({ where: { userId: id } }),
  ]);

  const totalSpent = paidOrders.reduce((sum, o) => sum + o.total, 0);

  return { ...user, orderCount, totalSpent, reviewCount };
}

interface UpdateResult {
  success: boolean;
  error?: string;
}

export async function toggleUserActive(
  id: string,
  actingAdminId: string
): Promise<UpdateResult> {
  try {
    if (id === actingAdminId) {
      return { success: false, error: "You cannot deactivate your own account." };
    }

    const user = await prisma.user.findUnique({ where: { id }, select: { isActive: true } });
    if (!user) return { success: false, error: "User not found." };

    await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return { success: true };
  } catch (error) {
    console.error("[admin-user.service] toggleUserActive failed:", error);
    return { success: false, error: "Could not update user status." };
  }
}

export async function updateUserRole(
  id: string,
  newRole: UserRole,
  actingAdminId: string
): Promise<UpdateResult> {
  try {
    if (id === actingAdminId && newRole !== "ADMIN") {
      return { success: false, error: "You cannot demote your own account." };
    }

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) return { success: false, error: "User not found." };

    await prisma.user.update({
      where: { id },
      data: { role: newRole },
    });

    return { success: true };
  } catch (error) {
    console.error("[admin-user.service] updateUserRole failed:", error);
    return { success: false, error: "Could not update user role." };
  }
}