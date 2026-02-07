"use client";

export function RouteListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          aria-hidden
        >
          <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-slate-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="flex shrink-0 gap-1">
            <div className="h-8 w-8 animate-pulse rounded bg-slate-100" />
            <div className="h-8 w-8 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
