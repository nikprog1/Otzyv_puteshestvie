"use client";

import { useState } from "react";
import Link from "next/link";
import { PromptCard } from "./PromptCard";
import { PromptDialog } from "./PromptDialog";
import type { Trip_Route } from "@prisma/client";

type RouteWithLikes = Trip_Route & { _count: { likes: number } };

type Sort = "popular" | "recent";

type PublicRoutesContentProps = {
  routes: RouteWithLikes[];
  favoriteRouteIds: string[];
  likedRouteIds: string[];
  currentUserId: string;
  pageNum: number;
  totalPages: number;
  sort: Sort;
};

export function PublicRoutesContent({
  routes,
  favoriteRouteIds,
  likedRouteIds,
  currentUserId,
  pageNum,
  totalPages,
  sort,
}: PublicRoutesContentProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Trip_Route | null>(null);
  const favoriteSet = new Set(favoriteRouteIds);
  const likedSet = new Set(likedRouteIds);

  const sortLink = (s: Sort) => {
    const params = new URLSearchParams();
    if (s !== "recent") params.set("sort", s);
    params.set("page", "1");
    const q = params.toString();
    return `/dashboard/public${q ? `?${q}` : ""}`;
  };

  const pageLink = (p: number) => {
    const params = new URLSearchParams();
    if (sort !== "recent") params.set("sort", sort);
    if (p > 1) params.set("page", String(p));
    const q = params.toString();
    return `/dashboard/public${q ? `?${q}` : ""}`;
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Публичные маршруты
        </h1>
        <div className="flex gap-2">
          <Link
            href={sortLink("popular")}
            className={`rounded border px-3 py-1.5 text-sm ${
              sort === "popular"
                ? "border-slate-400 bg-slate-200 font-medium text-slate-800"
                : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            По популярности
          </Link>
          <Link
            href={sortLink("recent")}
            className={`rounded border px-3 py-1.5 text-sm ${
              sort === "recent"
                ? "border-slate-400 bg-slate-200 font-medium text-slate-800"
                : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            По дате
          </Link>
        </div>
      </div>

      {routes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
          Публичных маршрутов пока нет.
        </div>
      ) : (
        <ul className="space-y-3">
          {routes.map((route) => (
            <li key={route.id}>
              <PromptCard
                route={route}
                isOwner={route.ownerId === currentUserId}
                isFavorite={favoriteSet.has(route.id)}
                likesCount={route._count.likes}
                likedByMe={likedSet.has(route.id)}
                onEdit={
                  route.ownerId === currentUserId
                    ? (r) => {
                        setEditingRoute(r);
                        setDialogOpen(true);
                      }
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}

      {dialogOpen && (
        <PromptDialog
          open={true}
          onClose={() => {
            setDialogOpen(false);
            setEditingRoute(null);
          }}
          mode={editingRoute ? "edit" : "create"}
          initialRoute={editingRoute}
        />
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2">
          {pageNum > 1 && (
            <Link
              href={pageLink(pageNum - 1)}
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
              href={pageLink(pageNum + 1)}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Вперёд
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
