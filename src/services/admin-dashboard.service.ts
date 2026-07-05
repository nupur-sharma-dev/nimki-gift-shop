import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/constants";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
  pendingReviewsCount: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  createdAt: Date;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    revenueResult,
    totalOrders,
    totalProducts,
    totalCustomers,
    lowStockCount,
    pendingReviewsCount,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "USER", isActive: true } }),
    prisma.product.count({
      where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
    }),
    prisma.review.count({ where: { isApproved: false } }),
  ]);

  return {
    totalRevenue: revenueResult._sum.total ?? 0,
    totalOrders,
    totalProducts,
    totalCustomers,
    lowStockCount,
    pendingReviewsCount,
  };
}

export async function getRecentOrders(limit: number = 8): Promise<RecentOrder[]> {
  const orders = await prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.user.name,
    customerEmail: order.user.email,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    total: order.total,
    createdAt: order.createdAt,
  }));
}