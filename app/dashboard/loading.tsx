import { RouteListSkeleton } from "./components/RouteListSkeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6">
      <div className="mb-6 h-10 w-full max-w-sm animate-pulse rounded border border-slate-200 bg-slate-100" />
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-36 animate-pulse rounded bg-slate-200" />
      </div>
      <RouteListSkeleton />
    </div>
  );
}
