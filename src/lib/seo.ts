import type { Metadata } from "next";
import { APP_NAME, APP_TAGLINE, APP_URL } from "@/constants";

interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string | null;
}

export function buildMetadata({
  title,
  description,
  path,
  image,
}: BuildMetadataOptions): Metadata {
  const url = `${APP_URL}${path}`;
  const trimmedDescription = description.slice(0, 160);

  return {
    title,
    description: trimmedDescription,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: trimmedDescription,
      url,
      siteName: APP_NAME,
      type: "website",
      ...(image
        ? { images: [{ url: image, width: 1200, height: 630, alt: title }] }
        : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description: trimmedDescription,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function defaultMetadata(): Metadata {
  return buildMetadata({
    title: APP_NAME,
    description: APP_TAGLINE,
    path: "/",
  });
}

interface ProductJsonLdInput {
  name: string;
  description: string;
  images: string[];
  price: number;
  slug: string;
  averageRating?: number;
  totalReviews?: number;
  inStock: boolean;
}

export function buildProductJsonLd(product: ProductJsonLdInput) {
  const url = `${APP_URL}/shop/${product.slug}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.slug,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "NPR",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  if (product.totalReviews && product.totalReviews > 0 && product.averageRating) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.averageRating,
      reviewCount: product.totalReviews,
    };
  }

  return jsonLd;
}

interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${APP_URL}${item.path}`,
    })),
  };
}