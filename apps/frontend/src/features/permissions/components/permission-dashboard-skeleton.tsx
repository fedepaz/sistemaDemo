// src/features/permissions/components/permission-dashboard-skeleton.tsx

export function PermissionsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg bg-muted/30 px-4 py-4"
        >
          <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-20 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-14 animate-pulse rounded bg-muted" />
          </div>
          <div className="ml-auto flex items-center gap-6">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex flex-col items-center gap-1.5">
                <div className="h-3 w-10 animate-pulse rounded bg-muted" />
                <div className="h-5 w-9 animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
