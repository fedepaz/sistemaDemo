// src/features/billboard/components/BillboardModalSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function BillboardModalSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border bg-card p-3 sm:p-4 space-y-2"
        >
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
