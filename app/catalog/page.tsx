import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { RouteCard, type RouteCardRoute } from "@/components/RouteCard";

const PAGE_SIZE = 20;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const skip = (pageNum - 1) * PAGE_SIZE;

  const [routes, total] = await Promise.all([
    prisma.trip_Route.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: { updatedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        owner: { select: { name: true } },
        tags: { include: { tag: { select: { name: true } } } },
        _count: { select: { likes: true } },
        // lj,fdktybt ajn — превью фото в карточке
        images: { orderBy: { order: "asc" }, take: 1 },
      },
    }),
    prisma.trip_Route.count({ where: { visibility: "PUBLIC" } }),
  ]);

  let likedSet = new Set<string>();
  if (session?.user?.id && routes.length > 0) {
    const likes = await prisma.like.findMany({
      where: {
        userId: session.user.id,
        routeId: { in: routes.map((r) => r.id) },
      },
      select: { routeId: true },
    });
    likedSet = new Set(likes.map((l) => l.routeId));
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-semibold">Каталог</h1>

      {routes.length === 0 ? (
        <p className="text-muted-foreground">Пока нет публичных маршрутов.</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {routes.map((route) => (
              <li key={route.id}>
                <RouteCard
                  route={route as RouteCardRoute}
                  likesCount={route._count.likes}
                  likedByMe={likedSet.has(route.id)}
                />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2">
              {pageNum > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={
                      pageNum === 2 ? "/catalog" : `/catalog?page=${pageNum - 1}`
                    }
                  >
                    Назад
                  </Link>
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                Страница {pageNum} из {totalPages}
              </span>
              {pageNum < totalPages && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/catalog?page=${pageNum + 1}`}>Вперёд</Link>
                </Button>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
