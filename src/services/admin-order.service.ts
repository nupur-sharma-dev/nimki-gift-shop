import { prisma } from "@/lib/prisma";
import type { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import type { PaginatedResponse } from "@/types";

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: Date;
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  notes: string | null;
  cancelReason: string | null;
  shippingSnapshot: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
  customer: { id: string; name: string | null; email: string };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
  }>;
  payment: {
    id: string;
    method: string;
    status: PaymentStatus;
    amount: number;
    esewaRefId: string | null;
    esewaTransactionId: string | null;
    paidAt: Date | null;
  } | null;
}

interface GetAdminOrdersParams {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
  limit?: number;
}

const TERMINAL_STATUSES: OrderStatus[] = ["CANCELLED", "REFUNDED"];

export async function getAdminOrders({
  search,
  status,
  paymentStatus,
  page = 1,
  limit = 10,
}: GetAdminOrdersParams): Promise<PaginatedResponse<AdminOrderListItem>> {
  const where: Prisma.OrderWhereInput = {};

  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;

  if (search?.trim()) {
    const term = search.trim();
    where.OR = [
      { orderNumber: { contains: term, mode: "insensitive" } },
      { user: { name: { contains: term, mode: "insensitive" } } },
      { user: { email: { contains: term, mode: "insensitive" } } },
    ];
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  const data: AdminOrderListItem[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.user.name ?? "—",
    customerEmail: o.user.email,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    total: o.total,
    createdAt: o.createdAt,
  }));

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data,
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

export async function getAdminOrderById(id: string): Promise<AdminOrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: true,
      payment: true,
    },
  });

  if (!order) return null;

  const snapshot = order.shippingSnapshot as AdminOrderDetail["shippingSnapshot"];

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    notes: order.notes,
    cancelReason: order.cancelReason,
    shippingSnapshot: snapshot,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customer: order.user,
    items: order.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      productImage: i.productImage,
      price: i.price,
      quantity: i.quantity,
    })),
    payment: order.payment
      ? {
          id: order.payment.id,
          method: order.payment.method,
          status: order.payment.status,
          amount: order.payment.amount,
          esewaRefId: order.payment.esewaRefId,
          esewaTransactionId: order.payment.esewaTransactionId,
          paidAt: order.payment.paidAt,
        }
      : null,
  };
}

interface UpdateResult {
  success: boolean;
  error?: string;
}

/**
 * Updates order status. Restocks products exactly once when transitioning
 * INTO CANCELLED or REFUNDED from a non-terminal status. Terminal statuses
 * (CANCELLED, REFUNDED) are locked from further status changes once reached.
 */
export async function updateOrderStatus(
  id: string,
  newStatus: OrderStatus,
  cancelReason?: string | null
): Promise<UpdateResult> {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return { success: false, error: "Order not found." };

    if (TERMINAL_STATUSES.includes(order.status)) {
      return {
        success: false,
        error: `Order is already ${order.status.toLowerCase()} and cannot be changed further.`,
      };
    }

    if (newStatus === "CANCELLED" && !cancelReason?.trim()) {
      return { success: false, error: "A cancellation reason is required." };
    }

    const shouldRestock =
      !TERMINAL_STATUSES.includes(order.status) && TERMINAL_STATUSES.includes(newStatus);

    await prisma.$transaction(async (tx) => {
      if (shouldRestock) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      await tx.order.update({
        where: { id },
        data: {
          status: newStatus,
          cancelReason: newStatus === "CANCELLED" ? cancelReason?.trim() : order.cancelReason,
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("[admin-order.service] updateOrderStatus failed:", error);
    return { success: false, error: "Could not update order status." };
  }
}

/**
 * Updates Payment.status and keeps Order.paymentStatus in sync.
 * Sets paidAt when transitioning into PAID. Locked once REFUNDED.
 */
export async function updatePaymentStatus(
  id: string,
  newPaymentStatus: PaymentStatus
): Promise<UpdateResult> {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!order) return { success: false, error: "Order not found." };
    if (!order.payment) return { success: false, error: "This order has no payment record." };

    if (order.paymentStatus === "REFUNDED") {
      return { success: false, error: "Payment is already refunded and cannot be changed." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId: id },
        data: {
          status: newPaymentStatus,
          paidAt:
            newPaymentStatus === "PAID" ? order.payment!.paidAt ?? new Date() : order.payment!.paidAt,
        },
      });

      await tx.order.update({
        where: { id },
        data: { paymentStatus: newPaymentStatus },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("[admin-order.service] updatePaymentStatus failed:", error);
    return { success: false, error: "Could not update payment status." };
  }
}