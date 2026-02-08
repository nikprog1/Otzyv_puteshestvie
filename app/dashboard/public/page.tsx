import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { PublicRoutesContent } from "../components/PublicRoutesContent";

const PAGE_SIZE = 10;

type Sort = "popular" | "recent";

export default async function PublicRoutesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { page, sort: sortParam } = await searchParams;
  const sort: Sort =
    sortParam === "popular" || sortParam === "recent" ? sortParam : "recent";
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const skip = (pageNum - 1) * PAGE_SIZE;

  const orderBy: Prisma.Trip_RouteOrderByWithRelationInput[] | Prisma.Trip_RouteOrderByWithRelationInput =
    sort === "popular"
      ? [
          { likes: { _count: "desc" } },
          { updatedAt: "desc" },
        ]
      : { updatedAt: "desc" };

  const [routes, total] = await Promise.all([
    prisma.trip_Route.findMany({
      where: { visibility: "PUBLIC" },
      orderBy,
      skip,
      take: PAGE_SIZE,
      include: {
        _count: { select: { likes: true } },
        images: { orderBy: { order: "asc" } },
      },
    }),
    prisma.trip_Route.count({ where: { visibility: "PUBLIC" } }),
  ]);

  const [favoriteRouteIds, likedRouteIds] = await Promise.all([
    prisma.favorite
      .findMany({
        where: {
          userId: session.user.id,
          routeId: { in: routes.map((r) => r.id) },
        },
        select: { routeId: true },
      })
      .then((rows) => rows.map((r) => r.routeId)),
    prisma.like
      .findMany({
        where: {
          userId: session.user.id,
          routeId: { in: routes.map((r) => r.id) },
        },
        select: { routeId: true },
      })
      .then((rows) => rows.map((r) => r.routeId)),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6">
      <PublicRoutesContent
        routes={routes}
        favoriteRouteIds={favoriteRouteIds}
        likedRouteIds={likedRouteIds}
        currentUserId={session.user.id}
        pageNum={pageNum}
        totalPages={totalPages}
        sort={sort}
      />
    </div>
  );
}
