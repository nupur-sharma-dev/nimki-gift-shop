// ── User ──────────────────────────────────────────────
export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Product ───────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  sku: string | null;
  images: string[];
  categoryId: string;
  category?: Category;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Product Card (listing subset) ────────────────────
export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string[];
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  averageRating?: number;
  totalReviews?: number;
}

// ── Category ──────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { products: number };
  createdAt: Date;
  updatedAt: Date;
}

// ── Category with count ──────────────────────────────
export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

// ── Order ─────────────────────────────────────────────
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentMethod = "ESEWA" | "CASH_ON_DELIVERY";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

// ── Cart ──────────────────────────────────────────────
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  slug: string;
}

// ── Address ───────────────────────────────────────────
export interface Address {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
}

// ── Review ────────────────────────────────────────────
export interface Review {
  id: string;
  userId: string;
  user?: Pick<User, "id" | "name" | "image">;
  productId: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── API Response ──────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ── Pagination ────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ── Filter / Sort ─────────────────────────────────────
export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  search?: string;
}

// ── Sort Options (values) ────────────────────────────
export const SORT_OPTIONS = [
  "newest",
  "oldest",
  "price-asc",
  "price-desc",
  "popular",
  "rating",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];