import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAddresses } from "@/services/address.service";
import AddressList from "@/components/store/AddressList/AddressList";
import styles from "./page.module.css";

export default async function AddressesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/addresses");
  }

  const addresses = await getAddresses(session.user.id);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Addresses</h1>
      <p className={styles.subtitle}>
        Manage the delivery addresses on your account.
      </p>
      <AddressList initialAddresses={JSON.parse(JSON.stringify(addresses))} />
    </div>
  );
}