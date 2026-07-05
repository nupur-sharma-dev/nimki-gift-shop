"use client";

import { useEffect } from "react";
import { trackBeginCheckout } from "@/lib/gtag";
import type { CartItemWithProduct } from "@/services/cart.service";

interface BeginCheckoutTrackerProps {
  items: CartItemWithProduct[];
  value: number;
}

export default function BeginCheckoutTracker({ items, value }: BeginCheckoutTrackerProps) {
  useEffect(() => {
    trackBeginCheckout(
      items.map((i) => ({
        item_id: i.productId,
        item_name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      })),
      value
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}