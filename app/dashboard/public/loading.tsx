import { RouteListSkeleton } from "../components/RouteListSkeleton";

export default function PublicLoading() {
  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="h-8 w-52 animate-pulse rounded bg-slate-200" />
        <div className="flex gap-2">
          <div className="h-9 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-9 w-24 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
      <RouteListSkeleton />
    </div>
  );
}
