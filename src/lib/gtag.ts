export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const isGAConfigured = Boolean(GA_MEASUREMENT_ID);

export interface GAItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity?: number;
}

function trackEvent(eventName: string, params: Record<string, unknown>): void {
  if (!isGAConfigured || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", eventName, params);
}

export function pageview(url: string): void {
  if (!isGAConfigured || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("config", GA_MEASUREMENT_ID as string, { page_path: url });
}

export function trackViewItem(item: GAItem): void {
  trackEvent("view_item", {
    currency: "NPR",
    value: item.price,
    items: [item],
  });
}

export function trackAddToCart(item: GAItem): void {
  trackEvent("add_to_cart", {
    currency: "NPR",
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackBeginCheckout(items: GAItem[], value: number): void {
  trackEvent("begin_checkout", {
    currency: "NPR",
    value,
    items,
  });
}

export function trackPurchase(params: {
  transactionId: string;
  value: number;
  shipping: number;
  items: GAItem[];
}): void {
  trackEvent("purchase", {
    transaction_id: params.transactionId,
    currency: "NPR",
    value: params.value,
    shipping: params.shipping,
    items: params.items,
  });
}