import { RouteListSkeleton } from "../components/RouteListSkeleton";

export default function FavoritesLoading() {
  return (
    <div className="p-6">
      <div className="mb-6 h-8 w-32 animate-pulse rounded bg-slate-200" />
      <RouteListSkeleton />
    </div>
  );
}
