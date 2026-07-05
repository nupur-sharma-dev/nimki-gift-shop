"use client";

import { useEffect } from "react";
import { trackViewItem } from "@/lib/gtag";

interface ViewItemTrackerProps {
  productId: string;
  productName: string;
  price: number;
  categoryName?: string;
}

export default function ViewItemTracker({
  productId,
  productName,
  price,
  categoryName,
}: ViewItemTrackerProps) {
  useEffect(() => {
    trackViewItem({
      item_id: productId,
      item_name: productName,
      item_category: categoryName,
      price,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return null;
}