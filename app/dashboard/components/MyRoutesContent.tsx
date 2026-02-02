"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PromptCard } from "./PromptCard";
import { PromptDialog } from "./PromptDialog";
import type { Trip_Route } from "@prisma/client";

type MyRoutesContentProps = {
  routes: Trip_Route[];
  favoriteRouteIds: string[];
  currentUserId: string;
};

const PAGE_SIZE = 10;

export function MyRoutesContent({
  routes,
  favoriteRouteIds,
  currentUserId,
}: MyRoutesContentProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Trip_Route | null>(null);
  const favoriteSet = new Set(favoriteRouteIds);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Мои маршруты</h1>
        <button
          type="button"
          onClick={() => {
            setEditingRoute(null);
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          Новый маршрут
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
          У вас пока нет маршрутов — создайте первый.
        </div>
      ) : (
        <ul className="space-y-3">
          {routes.map((route) => (
            <li key={route.id}>
              <PromptCard
                route={route}
                isOwner={route.ownerId === currentUserId}
                isFavorite={favoriteSet.has(route.id)}
                onEdit={(r) => {
                  setEditingRoute(r);
                  setDialogOpen(true);
                }}
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
    </>
  );
}
