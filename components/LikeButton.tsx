"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp } from "lucide-react";

type LikeButtonProps = {
  routeId: string;
  initialLiked: boolean;
  initialCount: number;
};

export function LikeButton({
  routeId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (loading) return;
    setError(null);
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setLoading(true);

    try {
      const res = await fetch(`/api/routes/${routeId}/like`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLiked(prevLiked);
        setCount(prevCount);
        if (res.status === 401) {
          setError("Войдите, чтобы поставить лайк");
          router.push("/login");
          return;
        }
        if (res.status === 404) {
          setError("Маршрут недоступен");
          return;
        }
        setError("Попробуйте позже");
        return;
      }

      setLiked(data.liked ?? !prevLiked);
      setCount(typeof data.likesCount === "number" ? data.likesCount : count);
      router.refresh();
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
      setError("Попробуйте позже");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-blue-600 disabled:opacity-50"
        title={liked ? "Убрать лайк" : "Нравится"}
      >
        <ThumbsUp
          className={`h-5 w-5 ${liked ? "fill-blue-500 text-blue-600" : ""}`}
        />
      </button>
      <span className="min-w-[1.25rem] text-sm text-muted-foreground">{count}</span>
      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
