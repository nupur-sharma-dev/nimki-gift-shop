"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/gtag";

interface PurchaseItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface PurchaseTrackerProps {
  transactionId: string;
  value: number;
  shipping: number;
  items: PurchaseItem[];
}

export default function PurchaseTracker({
  transactionId,
  value,
  shipping,
  items,
}: PurchaseTrackerProps) {
  useEffect(() => {
    trackPurchase({
      transactionId,
      value,
      shipping,
      items: items.map((i) => ({
        item_id: i.productId,
        item_name: i.productName,
        price: i.price,
        quantity: i.quantity,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  return null;
}