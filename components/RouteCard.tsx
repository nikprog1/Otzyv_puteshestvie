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

export function RouteCard({ route, likesCount, likedByMe }: RouteCardProps) {
  return (
    <Card className="flex flex-col">
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
