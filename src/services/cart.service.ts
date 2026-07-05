import { prisma } from "@/lib/prisma";

export interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    images: string[];
    stock: number;
    isActive: boolean;
  };
}

export interface CartSummary {
  items: CartItemWithProduct[];
  itemCount: number;
  subtotal: number;
}

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  price: true,
  comparePrice: true,
  images: true,
  stock: true,
  isActive: true,
} as const;

export async function getCartItemCount(
  userId: string | undefined | null
): Promise<number> {
  if (!userId) return 0;

  try {
    const result = await prisma.cartItem.aggregate({
      where: { userId },
      _sum: { quantity: true },
    });

    return result._sum.quantity ?? 0;
  } catch (error) {
    console.error("[cart.service] getCartItemCount failed:", error);
    return 0;
  }
}

export async function getCart(
  userId: string | undefined | null
): Promise<CartSummary> {
  if (!userId) return { items: [], itemCount: 0, subtotal: 0 };

  try {
    const rows = await prisma.cartItem.findMany({
      where: { userId, product: { isActive: true } },
      include: { product: { select: PRODUCT_SELECT } },
      orderBy: { createdAt: "desc" },
    });

    const items = rows as unknown as CartItemWithProduct[];
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );

    return { items, itemCount, subtotal };
  } catch (error) {
    console.error("[cart.service] getCart failed:", error);
    return { items: [], itemCount: 0, subtotal: 0 };
  }
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number,
  maxQuantity: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, isActive: true },
    });

    if (!product || !product.isActive) {
      return { success: false, error: "Product not found." };
    }
    if (product.stock <= 0) {
      return { success: false, error: "This item is out of stock." };
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    const nextQty = Math.min(
      (existing?.quantity ?? 0) + quantity,
      maxQuantity,
      product.stock
    );

    if (existing) {
      await prisma.cartItem.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity: nextQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { userId, productId, quantity: nextQty },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("[cart.service] addToCart failed:", error);
    return { success: false, error: "Could not add item to cart." };
  }
}

export async function updateCartItemQuantity(
  userId: string,
  productId: string,
  quantity: number,
  maxQuantity: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { userId_productId: { userId, productId } },
      });
      return { success: true };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });
    if (!product) return { success: false, error: "Product not found." };

    const clamped = Math.min(quantity, maxQuantity, product.stock);

    await prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity: clamped },
    });

    return { success: true };
  } catch (error) {
    console.error("[cart.service] updateCartItemQuantity failed:", error);
    return { success: false, error: "Could not update cart item." };
  }
}

export async function removeFromCart(
  userId: string,
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } },
    });
    return { success: true };
  } catch (error) {
    console.error("[cart.service] removeFromCart failed:", error);
    return { success: false, error: "Could not remove cart item." };
  }
}

export async function clearCart(
  userId: string
): Promise<{ success: boolean }> {
  try {
    await prisma.cartItem.deleteMany({ where: { userId } });
    return { success: true };
  } catch (error) {
    console.error("[cart.service] clearCart failed:", error);
    return { success: false };
  }
}