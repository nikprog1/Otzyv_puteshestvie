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
