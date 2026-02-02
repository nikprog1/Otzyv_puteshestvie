import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Настройки</h1>
      <p className="text-slate-600">Скоро.</p>
    </div>
  );
}
