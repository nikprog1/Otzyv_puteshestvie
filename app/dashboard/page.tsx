import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SearchInput } from "./components/SearchInput";
import { MyRoutesContent } from "./components/MyRoutesContent";
import Link from "next/link";

const PAGE_SIZE = 10;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { q, page } = await searchParams;
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const search = (q ?? "").trim();
  const skip = (pageNum - 1) * PAGE_SIZE;

  const where = {
    ownerId: session.user.id,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { content: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [routes, total] = await Promise.all([
    prisma.trip_Route.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.trip_Route.count({ where }),
  ]);

  const favoriteRouteIds = (
    await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
        routeId: { in: routes.map((r) => r.id) },
      },
      select: { routeId: true },
    })
  ).map((f) => f.routeId);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6">
      <div className="mb-6">
        <Suspense fallback={<div className="h-10 w-full max-w-sm rounded border border-slate-200 bg-slate-100" />}>
          <SearchInput placeholder="Поиск по названию или описанию…" />
        </Suspense>
      </div>

      <MyRoutesContent
        routes={routes}
        favoriteRouteIds={favoriteRouteIds}
        currentUserId={session.user.id}
      />

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2">
          {pageNum > 1 && (
            <Link
              href={
                pageNum === 2
                  ? (q ? `/dashboard?q=${encodeURIComponent(q)}` : "/dashboard")
                  : q
                    ? `/dashboard?q=${encodeURIComponent(q)}&page=${pageNum - 1}`
                    : `/dashboard?page=${pageNum - 1}`
              }
              className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Назад
            </Link>
          )}
          <span className="text-sm text-slate-600">
            Страница {pageNum} из {totalPages}
          </span>
          {pageNum < totalPages && (
            <Link
              href={
                q
                  ? `/dashboard?q=${encodeURIComponent(q)}&page=${pageNum + 1}`
                  : `/dashboard?page=${pageNum + 1}`
              }
              className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Вперёд
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
