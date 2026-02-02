import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PublicRoutesContent } from "../components/PublicRoutesContent";

const PAGE_SIZE = 10;

export default async function PublicRoutesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const skip = (pageNum - 1) * PAGE_SIZE;

  const [routes, total] = await Promise.all([
    prisma.trip_Route.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: { updatedAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.trip_Route.count({ where: { visibility: "PUBLIC" } }),
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
      <PublicRoutesContent
        routes={routes}
        favoriteRouteIds={favoriteRouteIds}
        currentUserId={session.user.id}
        pageNum={pageNum}
        totalPages={totalPages}
      />
    </div>
  );
}
