import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FavoritesContent } from "../components/FavoritesContent";

const PAGE_SIZE = 10;

export default async function FavoritesPage({
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
      where: {
        favorites: { some: { userId: session.user.id } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { images: { orderBy: { order: "asc" } } },
    }),
    prisma.trip_Route.count({
      where: {
        favorites: { some: { userId: session.user.id } },
      },
    }),
  ]);

  const favoriteRouteIds = routes.map((r) => r.id);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6">
      <FavoritesContent
        routes={routes}
        favoriteRouteIds={favoriteRouteIds}
        currentUserId={session.user.id}
        pageNum={pageNum}
        totalPages={totalPages}
      />
    </div>
  );
}
