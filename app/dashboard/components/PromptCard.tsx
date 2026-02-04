"use client";

import {
  MessageSquare,
  Star,
  Pencil,
  Trash2,
  Globe,
  Lock,
} from "lucide-react";
import { deleteRoute, toggleVisibility, toggleFavorite } from "../actions";
import { LikeButton } from "./LikeButton";
import type { Trip_Route } from "@prisma/client";

type PromptCardProps = {
  route: Trip_Route;
  isOwner: boolean;
  isFavorite: boolean;
  onEdit?: (route: Trip_Route) => void;
  likesCount?: number;
  likedByMe?: boolean;
};

function preview(text: string, maxLen = 120) {
  const t = (text ?? "").trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen).trim() + "…";
}

export function PromptCard({
  route,
  isOwner,
  isFavorite,
  onEdit,
  likesCount,
  likedByMe = false,
}: PromptCardProps) {
  async function handleDelete() {
    if (!confirm("Удалить маршрут?")) return;
    await deleteRoute(route.id);
  }

  async function handleToggleVisibility() {
    await toggleVisibility(route.id);
  }

  async function handleToggleFavorite() {
    await toggleFavorite(route.id);
  }

  return (
    <article className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow">
      <div className="mt-0.5 shrink-0 text-slate-400">
        <MessageSquare className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-slate-900">{route.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
          {preview(route.content)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {typeof likesCount === "number" && (
          <LikeButton
            routeId={route.id}
            initialLiked={likedByMe}
            initialCount={likesCount}
          />
        )}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-500"
          title={isFavorite ? "Убрать из избранного" : "В избранное"}
        >
          <Star
            className={`h-5 w-5 ${isFavorite ? "fill-amber-400 text-amber-500" : ""}`}
          />
        </button>
        {isOwner && (
          <>
            <button
              type="button"
              onClick={handleToggleVisibility}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              title={route.visibility === "PUBLIC" ? "Сделать приватным" : "Опубликовать"}
            >
              {route.visibility === "PUBLIC" ? (
                <Globe className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(route)}
                className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                title="Редактировать"
              >
                <Pencil className="h-5 w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
              title="Удалить"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
