import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/store/ProfileForm/ProfileForm";
import styles from "./page.module.css";

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { password: true },
  });

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Edit Profile</h1>
      <ProfileForm hasPassword={Boolean(user?.password)} />
    </div>
  );
}