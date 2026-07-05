import { prisma } from "@/lib/prisma";
import { getCart } from "@/services/cart.service";
import { getAddressById } from "@/services/address.service";
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from "@/constants";
import type { CheckoutIntent } from "@/lib/checkout-intent";
import type { EsewaCallbackData } from "@/lib/esewa";

interface CreateOrderResult {
  success: boolean;
  error?: string;
  orderId?: string;
  orderNumber?: string;
}

function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `NMK-${y}${m}${d}-${rand}`;
}

export async function calculateCartTotals(userId: string) {
  const cart = await getCart(userId);
  const subtotal = cart.subtotal;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;
  return { cart, subtotal, shippingCost, total };
}

/**
 * Cash on Delivery — order is created immediately from the user's live cart.
 */
export async function createCodOrder(
  userId: string,
  addressId: string,
  notes: string | null
): Promise<CreateOrderResult> {
  try {
    const address = await getAddressById(userId, addressId);
    if (!address) {
      return { success: false, error: "Selected address not found." };
    }

    const { cart, subtotal, shippingCost, total } = await calculateCartTotals(userId);
    if (cart.items.length === 0) {
      return { success: false, error: "Your cart is empty." };
    }

    for (const item of cart.items) {
      if (!item.product.isActive) {
        return { success: false, error: `${item.product.name} is no longer available.` };
      }
      if (item.quantity > item.product.stock) {
        return {
          success: false,
          error: `Only ${item.product.stock} of "${item.product.name}" left in stock.`,
        };
      }
    }

    const orderNumber = generateOrderNumber();
    const shippingSnapshot = {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? null,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
    };

    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId,
          paymentMethod: "CASH_ON_DELIVERY",
          subtotal,
          shippingCost,
          total,
          shippingSnapshot,
          notes: notes?.trim() || null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productImage: item.product.images[0] ?? "",
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
          payment: {
            create: {
              method: "CASH_ON_DELIVERY",
              amount: total,
            },
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { userId } });

      return createdOrder;
    });

    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (error) {
    console.error("[order.service] createCodOrder failed:", error);
    return { success: false, error: "Could not place order. Please try again." };
  }
}

/**
 * eSewa — order is created only after payment has been confirmed.
 * Uses the snapshot captured in the signed checkout intent (not the live cart),
 * with a final stock re-check at confirmation time.
 */
export async function createEsewaOrder(
  intent: CheckoutIntent,
  esewaData: EsewaCallbackData
): Promise<CreateOrderResult> {
  try {
    const address = await getAddressById(intent.userId, intent.addressId);
    if (!address) {
      return { success: false, error: "Delivery address not found." };
    }

    for (const item of intent.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { stock: true, isActive: true, name: true },
      });
      if (!product || !product.isActive) {
        return { success: false, error: `${item.name} is no longer available.` };
      }
      if (item.quantity > product.stock) {
        return { success: false, error: `Only ${product.stock} of "${item.name}" left in stock.` };
      }
    }

    const orderNumber = generateOrderNumber();
    const shippingSnapshot = {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? null,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
    };

    const order = await prisma.$transaction(async (tx) => {
      for (const item of intent.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: intent.userId,
          addressId: intent.addressId,
          paymentMethod: "ESEWA",
          paymentStatus: "PAID",
          subtotal: intent.subtotal,
          shippingCost: intent.shippingCost,
          total: intent.total,
          shippingSnapshot,
          notes: intent.notes?.trim() || null,
          items: {
            create: intent.items.map((item) => ({
              productId: item.productId,
              productName: item.name,
              productImage: item.image,
              price: item.price,
              quantity: item.quantity,
            })),
          },
          payment: {
            create: {
              method: "ESEWA",
              status: "PAID",
              amount: intent.total,
              esewaRefId: esewaData.transaction_code,
              esewaTransactionId: esewaData.transaction_uuid,
              esewaSignedField: esewaData.signed_field_names,
              esewaRawResponse: esewaData,
              paidAt: new Date(),
            },
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: {
          userId: intent.userId,
          productId: { in: intent.items.map((i) => i.productId) },
        },
      });

      return createdOrder;
    });

    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (error) {
    console.error("[order.service] createEsewaOrder failed:", error);
    return { success: false, error: "Could not finalize order after payment." };
  }
}

export async function getOrderById(userId: string, orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    });
    if (!order || order.userId !== userId) return null;
    return order;
  } catch (error) {
    console.error("[order.service] getOrderById failed:", error);
    return null;
  }
}