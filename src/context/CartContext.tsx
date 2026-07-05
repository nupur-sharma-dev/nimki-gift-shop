"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MAX_CART_QUANTITY, ROUTES } from "@/constants";
import type { CartItemWithProduct } from "@/services/cart.service";

interface CartContextValue {
  items: CartItemWithProduct[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({
  children,
  initialItemCount = 0,
}: {
  children: ReactNode;
  initialItemCount?: number;
}) {
  const { status } = useSession();
  const router = useRouter();

  // ...rest of the file is unchanged

  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [itemCount, setItemCount] = useState(initialItemCount);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) return;
      const json = await res.json();
      setItems(json.data.items);
      setItemCount(json.data.itemCount);
      setSubtotal(json.data.subtotal);
    } catch (error) {
      console.error("[CartContext] refresh failed:", error);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") refresh();
    if (status === "unauthenticated") {
      setItems([]);
      setItemCount(0);
      setSubtotal(0);
    }
  }, [status, refresh]);

  const requireAuth = useCallback(() => {
    if (status === "authenticated") return true;
    router.push(`${ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    return false;
  }, [status, router]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      if (!requireAuth()) return;
      setLoading(true);
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error(json.error ?? "Could not add to cart.");
          return;
        }
        toast.success("Added to cart");
        await refresh();
      } catch (error) {
        console.error("[CartContext] addItem failed:", error);
        toast.error("Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [requireAuth, refresh]
  );

  const updateItem = useCallback(
    async (productId: string, quantity: number) => {
      if (!requireAuth()) return;
      const clamped = Math.min(Math.max(quantity, 0), MAX_CART_QUANTITY);

      // optimistic update
      setItems((prev) =>
        clamped === 0
          ? prev.filter((i) => i.productId !== productId)
          : prev.map((i) => (i.productId === productId ? { ...i, quantity: clamped } : i))
      );

      try {
        const res = await fetch(`/api/cart/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: clamped }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error(json.error ?? "Could not update cart.");
        }
        await refresh();
      } catch (error) {
        console.error("[CartContext] updateItem failed:", error);
        await refresh();
      }
    },
    [requireAuth, refresh]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!requireAuth()) return;
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      try {
        const res = await fetch(`/api/cart/${productId}`, { method: "DELETE" });
        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error(json.error ?? "Could not remove item.");
        }
        toast.success("Removed from cart");
        await refresh();
      } catch (error) {
        console.error("[CartContext] removeItem failed:", error);
        await refresh();
      }
    },
    [requireAuth, refresh]
  );

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, loading, addItem, updateItem, removeItem, refresh }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}