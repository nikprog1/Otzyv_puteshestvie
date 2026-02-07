import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { RouteCard, type RouteCardRoute } from "@/components/RouteCard";

const TAKE = 20;

const routeInclude = {
  owner: { select: { name: true } },
  tags: { include: { tag: { select: { name: true } } } },
  _count: { select: { likes: true } },
} as const;

export default async function HomePage() {
  const session = await auth();

  const [recentRoutes, popularRoutes] = await Promise.all([
    prisma.trip_Route.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: { createdAt: "desc" },
      take: TAKE,
      include: routeInclude,
    }),
    prisma.trip_Route.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: [
        { likes: { _count: "desc" } },
        { createdAt: "desc" },
      ] as Prisma.Trip_RouteOrderByWithRelationInput[],
      take: TAKE,
      include: routeInclude,
    }),
  ]);

  const allIds = [
    ...recentRoutes.map((r) => r.id),
    ...popularRoutes.map((r) => r.id),
  ];
  const uniqueIds = [...new Set(allIds)];

  let likedSet = new Set<string>();
  if (session?.user?.id) {
    const likes = await prisma.like.findMany({
      where: {
        userId: session.user.id,
        routeId: { in: uniqueIds },
      },
      select: { routeId: true },
    });
    likedSet = new Set(likes.map((l) => l.routeId));
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Маршруты путешествий
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Создавайте и находите проверенные маршруты
        </p>
        <div className="mt-6 flex flex-col items-center gap-2">
          {session?.user ? (
            <Button asChild size="lg">
              <Link href="/dashboard">Добавить маршрут</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/login">Добавить маршрут</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Войдите, чтобы добавлять маршруты
              </p>
            </>
          )}
        </div>
      </section>

      {/* Новые */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold">Новые</h2>
        {recentRoutes.length === 0 ? (
          <p className="text-muted-foreground">Пока нет публичных маршрутов.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentRoutes.map((route) => (
              <li key={route.id}>
                <RouteCard
                  route={route as RouteCardRoute}
                  likesCount={route._count.likes}
                  likedByMe={likedSet.has(route.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Популярные */}
      <section>
        <h2 className="mb-6 text-2xl font-semibold">Популярные</h2>
        {popularRoutes.length === 0 ? (
          <p className="text-muted-foreground">Пока нет публичных маршрутов.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {popularRoutes.map((route) => (
              <li key={route.id}>
                <RouteCard
                  route={route as RouteCardRoute}
                  likesCount={route._count.likes}
                  likedByMe={likedSet.has(route.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
