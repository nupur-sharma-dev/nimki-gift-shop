import { type ClassValue, clsx } from "clsx";
import type { ProductFilters } from "@/types";

// ── Class Names ───────────────────────────────────────
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// ── Currency ──────────────────────────────────────────
export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-NP")}`;
}

// ── Slug ──────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Order Number ──────────────────────────────────────
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NIMKI-${timestamp}-${random}`;
}

// ── Truncate ──────────────────────────────────────────
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}...`;
}

// ── Date ──────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-NP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// ── Discount ──────────────────────────────────────────
export function calculateDiscount(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

// ── Initials ──────────────────────────────────────────
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ── Validate Email ────────────────────────────────────
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Clamp ─────────────────────────────────────────────
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ── Build Product Filters from URL Params ─────────────
export function buildProductFilters(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): ProductFilters {
  const params = searchParams instanceof URLSearchParams
    ? Object.fromEntries(searchParams.entries())
    : searchParams;

  const filters: ProductFilters = {};

  if (params.category && typeof params.category === "string") {
    filters.categoryId = params.category;
  }

  if (params.minPrice) {
    const val = parseInt(params.minPrice as string, 10);
    if (!isNaN(val)) filters.minPrice = val;
  }

  if (params.maxPrice) {
    const val = parseInt(params.maxPrice as string, 10);
    if (!isNaN(val)) filters.maxPrice = val;
  }

  if (params.search && typeof params.search === "string") {
    filters.search = params.search;
  }

  if (params.inStock === "true") {
    filters.inStock = true;
  }

  return filters;
}