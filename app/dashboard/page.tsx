import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const routes = await prisma.trip_Route.findMany({
    where: {
      OR: [{ visibility: "PUBLIC" }, { ownerId: session.user.id }],
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Личный кабинет</h1>
            <p className="text-sm text-zinc-600">
              Вы вошли как {session.user.email}
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Маршруты</h2>
          <p className="text-sm text-zinc-600">
            Приватные маршруты доступны только владельцу.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {routes.map((route) => (
              <li
                key={route.id}
                className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2"
              >
                <span>{route.title}</span>
                <span className="text-xs text-zinc-500">
                  {route.visibility}
                </span>
              </li>
            ))}
            {routes.length === 0 && (
              <li className="text-sm text-zinc-500">Маршрутов пока нет.</li>
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}
