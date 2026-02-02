import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "./components/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-[280px] shrink-0">
        <DashboardSidebar user={session.user} />
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
