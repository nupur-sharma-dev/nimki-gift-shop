import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AccountSidebar from "@/components/store/AccountSidebar/AccountSidebar";
import styles from "./layout.module.css";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  return (
    <div className={`container ${styles.wrapper}`}>
      <AccountSidebar
        name={session.user.name}
        email={session.user.email}
        image={session.user.image}
      />
      <div className={styles.content}>{children}</div>
    </div>
  );
}