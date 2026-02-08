// lj,fdktybt ajn (добавление фото)
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AvatarUpload } from "../components/AvatarUpload";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Настройки</h1>

      {/* lj,fdktybt ajn — загрузка аватара (заглушено в AvatarUpload) */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-medium text-slate-800">Аватар</h2>
        <AvatarUpload currentImageUrl={session.user.image} />
      </section>
    </div>
  );
}
