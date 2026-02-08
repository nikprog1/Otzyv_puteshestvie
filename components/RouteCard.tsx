import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/LikeButton";

export type RouteCardRoute = {
  id: string;
  title: string;
  createdAt: Date;
  owner: { name: string | null };
  tags: { tag: { name: string } }[];
  _count: { likes: number };
  images?: { url600: string | null; url300: string | null; url150: string | null; original: string }[];
};

type RouteCardProps = {
  route: RouteCardRoute;
  likesCount: number;
  likedByMe: boolean;
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// lj,fdktybt ajn (добавление фото) — отображение превью в каталоге
function cardImageUrl(route: RouteCardRoute): string | null {
  const first = route.images?.[0];
  if (!first) return null;
  return first.url600 ?? first.url300 ?? first.url150 ?? first.original ?? null;
}

export function RouteCard({ route, likesCount, likedByMe }: RouteCardProps) {
  const imageUrl = cardImageUrl(route);
  return (
    <Card className="flex flex-col overflow-hidden">
      {imageUrl && (
        <Link href={`/routes/${route.id}`} className="block aspect-[16/10] w-full overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </Link>
      )}
      <CardHeader className="gap-1 pb-2">
        <h3 className="line-clamp-2 font-semibold leading-tight">
          {route.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {route.owner?.name ?? "Без имени"}, {formatDate(route.createdAt)}
        </p>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        {route.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {route.tags.map((t) => (
              <Badge key={t.tag.name} variant="secondary" className="text-xs">
                {t.tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
        <div className="flex items-center gap-2">
          <LikeButton
            routeId={route.id}
            initialLiked={likedByMe}
            initialCount={likesCount}
          />
        </div>
        <Button asChild size="sm">
          <Link href={`/routes/${route.id}`}>Открыть</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
