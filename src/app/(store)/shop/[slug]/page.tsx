import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProductBySlug, getRelatedProducts } from "@/services/product.service";
import { canUserReviewProduct, getUserReviewForProduct } from "@/services/review.service";
import { formatCurrency, calculateDiscount } from "@/utils";
import ProductGallery from "@/components/store/ProductGallery/ProductGallery";
import AddToCartSection from "@/components/store/AddToCartSection/AddToCartSection";
import ProductReviews from "@/components/store/ProductReviews/ProductReviews";
import RelatedProducts from "@/components/store/RelatedProducts/RelatedProducts";
import { ROUTES } from "@/constants";
import styles from "./page.module.css";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product || !product.isActive) {
    notFound();
  }

  const discount = product.comparePrice
    ? calculateDiscount(product.price, product.comparePrice)
    : 0;

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  // Get related products
  const relatedProducts = await getRelatedProducts(
    product.id,
    product.categoryId,
    4
  );

  // Get reviews with user info
  const reviews = product.reviews || [];
  const averageRating = product.averageRating || 0;
  const totalReviews = product.totalReviews || 0;

  // Review eligibility + existing review for the current user (if logged in)
  const session = await getServerSession(authOptions);
  let canReview = false;
  let userReview = null;

  if (session?.user?.id) {
    const [eligible, existing] = await Promise.all([
      canUserReviewProduct(session.user.id, product.id),
      getUserReviewForProduct(session.user.id, product.id),
    ]);
    canReview = eligible;
    userReview = existing;
  }

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <ol>
            <li>
              <a href={ROUTES.HOME}>Home</a>
            </li>
            <li>
              <a href={ROUTES.CATEGORY(product.category?.slug || "")}>
                {product.category?.name || "Products"}
              </a>
            </li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>

        {/* Product Section */}
        <div className={styles.product}>
          <div className={styles.gallery}>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          <div className={styles.info}>
            {product.category && (
              <a
                href={ROUTES.CATEGORY(product.category.slug)}
                className={styles.category}
              >
                {product.category.name}
              </a>
            )}

            <h1 className={styles.title}>{product.name}</h1>

            <div className={styles.rating}>
              {averageRating > 0 && totalReviews > 0 ? (
                <>
                  <span className={styles.stars}>
                    {"★".repeat(Math.floor(averageRating))}
                    {averageRating % 1 >= 0.5 && "★"}
                    {"☆".repeat(5 - Math.ceil(averageRating))}
                  </span>
                  <span className={styles.reviewCount}>
                    ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                  </span>
                </>
              ) : (
                <span className={styles.noReviews}>No reviews yet</span>
              )}
            </div>

            <div className={styles.pricing}>
              <span className={styles.currentPrice}>
                {formatCurrency(product.price)}
              </span>
              {product.comparePrice && (
                <span className={styles.comparePrice}>
                  {formatCurrency(product.comparePrice)}
                </span>
              )}
              {discount > 0 && (
                <span className={styles.discountBadge}>-{discount}%</span>
              )}
            </div>

            <div className={styles.stock}>
              {isOutOfStock ? (
                <span className={styles.stockOut}>Out of Stock</span>
              ) : isLowStock ? (
                <span className={styles.stockLow}>Low Stock — Only {product.stock} left</span>
              ) : (
                <span className={styles.stockIn}>In Stock</span>
              )}
            </div>

            <p className={styles.description}>{product.description}</p>

            {!isOutOfStock && (<AddToCartSection productId={product.id} stock={product.stock} />
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <section className={styles.reviewsSection}>
          <h2 className={styles.sectionTitle}>Customer Reviews</h2>
          <ProductReviews
            reviews={reviews}
            averageRating={averageRating}
            totalReviews={totalReviews}
            productId={product.id}
            canReview={canReview}
            userReview={userReview}
          />
        </section>

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}