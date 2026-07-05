import AuthSlideshow from "@/components/auth/AuthSlideshow";
import styles from "./layout.module.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <div className={styles.left}>
        <AuthSlideshow />
      </div>
      <div className={styles.right}>
        <div className={styles.formContainer}>{children}</div>
      </div>
    </div>
  );
}