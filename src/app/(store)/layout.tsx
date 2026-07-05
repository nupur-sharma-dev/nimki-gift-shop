import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteSettings } from "@/services/site-settings.service";
import { getCartItemCount } from "@/services/cart.service";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/store/Header/Header";
import Footer from "@/components/store/Footer/Footer";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const [siteSettings, cartCount] = await Promise.all([
    getSiteSettings(),
    getCartItemCount(session?.user?.id),
  ]);

  return (
    <CartProvider initialItemCount={cartCount}>
      <Header
        announcementBar={siteSettings.announcementBar}
        isStoreOpen={siteSettings.isStoreOpen}
        cartCount={cartCount}
      />
      <main>{children}</main>
      <Footer />
    </CartProvider>
  );
}