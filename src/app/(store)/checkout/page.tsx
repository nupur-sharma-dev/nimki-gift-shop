import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCart } from "@/services/cart.service";
import { getAddresses } from "@/services/address.service";
import { ROUTES } from "@/constants";
import CheckoutForm from "@/components/store/CheckoutForm/CheckoutForm";
import styles from "./page.module.css";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [cart, addresses] = await Promise.all([getCart(userId), getAddresses(userId)]);

  if (cart.items.length === 0) {
    redirect(ROUTES.CART);
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Checkout</h1>
      <CheckoutForm cart={cart} addresses={addresses} />
    </div>
  );
}