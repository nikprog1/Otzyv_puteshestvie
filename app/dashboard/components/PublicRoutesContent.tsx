"use client";

import { useState } from "react";
import Link from "next/link";
import { PromptCard } from "./PromptCard";
import { PromptDialog } from "./PromptDialog";
import type { Trip_Route } from "@prisma/client";

type PublicRoutesContentProps = {
  routes: Trip_Route[];
  favoriteRouteIds: string[];
  currentUserId: string;
  pageNum: number;
  totalPages: number;
};

export function PublicRoutesContent({
  routes,
  favoriteRouteIds,
  currentUserId,
  pageNum,
  totalPages,
}: PublicRoutesContentProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Trip_Route | null>(null);
  const favoriteSet = new Set(favoriteRouteIds);

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        Публичные маршруты
      </h1>

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
              href={
                pageNum === 2
                  ? "/dashboard/public"
                  : `/dashboard/public?page=${pageNum - 1}`
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
              href={`/dashboard/public?page=${pageNum + 1}`}
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
