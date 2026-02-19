// src/features/permissions/components/permission-dashboard-skeleton.tsx

export function PermissionsSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6 bg-muted/5">
      {/* Search area skeleton */}
      <div className="flex flex-col gap-4 mb-2 lg:flex-row lg:items-center">
        <div className="h-10 flex-1 rounded-xl bg-muted animate-pulse" />
        <div className="flex gap-4 justify-between lg:justify-end">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>

      {/* Row skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-6 rounded-xl border border-border/40 bg-background p-5 lg:flex-row lg:items-center"
        >
          {/* Label area */}
          <div className="flex items-center gap-4 lg:w-52">
            <div className="h-11 w-11 rounded-xl bg-muted animate-pulse" />
            <div className="flex flex-col gap-2">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
            </div>
          </div>

          {/* CRUD area */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 lg:flex-1 lg:flex lg:justify-around lg:px-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex flex-col items-center gap-3">
                <div className="h-3 w-8 rounded bg-muted animate-pulse" />
                <div className="h-6 w-11 rounded-full bg-muted animate-pulse" />
              </div>
            ))}
          </div>

          {/* Scope area */}
          <div className="flex flex-col gap-2 lg:w-48">
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="h-9 w-full rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
