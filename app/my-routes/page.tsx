import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MyRoutesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const routes = await prisma.trip_Route.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Мои маршруты</h1>
          <p className="text-sm text-zinc-600">
            Здесь видны только ваши приватные и публичные маршруты.
          </p>
        </header>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <ul className="space-y-2 text-sm">
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
