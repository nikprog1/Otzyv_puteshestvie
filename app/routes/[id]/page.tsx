import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/LikeButton";

export default async function RoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const route = await prisma.trip_Route.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, image: true } },
      tags: { include: { tag: { select: { name: true } } } },
      _count: { select: { likes: true } },
      images: { orderBy: { order: "asc" } },
    },
  });

  if (!route || route.visibility !== "PUBLIC") {
    notFound();
  }

  let likedByMe = false;
  if (session?.user?.id) {
    const like = await prisma.like.findUnique({
      where: {
        userId_routeId: { userId: session.user.id, routeId: id },
      },
    });
    likedByMe = !!like;
  }

  const dateStr = new Date(route.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/catalog">← Назад к каталогу</Link>
        </Button>
      </div>

      <article className="space-y-6">
        {/* lj,fdktybt ajn (добавление фото) — галерея фото маршрута */}
        {route.images.length > 0 && (
          <div className="space-y-2">
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {route.images.map((img) => {
                const url = img.url600 ?? img.url1080 ?? img.url300 ?? img.original;
                return (
                  <li key={img.id} className="overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={url}
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <header>
          <h1 className="text-3xl font-bold tracking-tight">{route.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {route.owner?.name ?? "Без имени"} · {dateStr}
          </p>
          {route.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {route.tags.map((t) => (
                <Badge key={t.tag.name} variant="secondary">
                  {t.tag.name}
                </Badge>
              ))}
            </div>
          )}
        </header>

        <div className="flex items-center gap-2 border-y py-4">
          <LikeButton
            routeId={route.id}
            initialLiked={likedByMe}
            initialCount={route._count.likes}
          />
        </div>

        {(route.description || route.content) && (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {route.description && (
              <p className="text-muted-foreground">{route.description}</p>
            )}
            <div className="whitespace-pre-wrap text-sm">{route.content}</div>
          </div>
        )}
      </article>
    </div>
  );
}
