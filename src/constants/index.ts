export const APP_NAME = "Nimki Gift Shop";
export const APP_TAGLINE = "Handmade with love, gifted with heart.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const ROUTES = {
  // Store
  HOME:           "/",
  SHOP:           "/shop",
  PRODUCT:        (slug: string) => `/shop/${slug}`,
  CATEGORIES:     "/categories",
  CATEGORY:       (slug: string) => `/categories/${slug}`,
  ABOUT:          "/about",
  CART:           "/cart",
  CHECKOUT:       "/checkout",
  ORDER_SUCCESS:  (id: string) => `/orders/${id}/success`,
  ORDERS:         "/account/orders",
  ORDER_DETAIL:   (id: string) => `/account/orders/${id}`,
  ACCOUNT:        "/account",
  ACCOUNT_PROFILE:"/account/profile",
  ACCOUNT_ADDRESSES: "/account/addresses",
  SEARCH: "/search",
  GIFT_FINDER: "/gift-finder",

  // Auth
  LOGIN:          "/login",
  REGISTER:       "/register",
  FORGOT_PASSWORD:"/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL:   "/verify-email",

  // Admin
  ADMIN:              "/admin",
  ADMIN_PRODUCTS:     "/admin/products",
  ADMIN_PRODUCTS_NEW: "/admin/products/new",
  ADMIN_PRODUCTS_EDIT: (id: string) => `/admin/products/${id}/edit`,
  ADMIN_CATEGORIES:   "/admin/categories",
  ADMIN_CATEGORIES_NEW: "/admin/categories/new",
  ADMIN_CATEGORIES_EDIT: (id: string) => `/admin/categories/${id}/edit`,
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_ORDERS_DETAIL: (id: string) => `/admin/orders/${id}`,
  ADMIN_CUSTOMERS:    "/admin/customers",
  ADMIN_CUSTOMERS_DETAIL: (id: string) => `/admin/customers/${id}`,
  ADMIN_REVIEWS:      "/admin/reviews",
  ADMIN_INVENTORY:    "/admin/inventory",
  ADMIN_SETTINGS:     "/admin/settings",
  
} as const;

export const PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 12,
  ADMIN_LIMIT:   20,
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING:    "Pending",
  CONFIRMED:  "Confirmed",
  PROCESSING: "Processing",
  SHIPPED:    "Shipped",
  DELIVERED:  "Delivered",
  CANCELLED:  "Cancelled",
  REFUNDED:   "Refunded",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  ESEWA:            "eSewa",
  CASH_ON_DELIVERY: "Cash on Delivery",
};

export const SHIPPING_COST = 100;
export const FREE_SHIPPING_THRESHOLD = 2000;

export const MAX_CART_QUANTITY = 10;
export const MAX_REVIEW_LENGTH = 500;
export const ORDER_NOTES_MAX_LENGTH = 300;
export const LOW_STOCK_THRESHOLD = 5;

export const SOCIAL_LINKS = {
  INSTAGRAM: "https://www.instagram.com/bouquetateiier/",
  FACEBOOK: "#",
  PINTEREST: "#",
} as const;