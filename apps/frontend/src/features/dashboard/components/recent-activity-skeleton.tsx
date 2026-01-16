// src/features/dashboard/components/recent-activity-skeleton.tsx

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>
          <Skeleton className="h-4 w-32 rounded-md" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-32 rounded-md" />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pb-4">
        <div className="h-full overflow-y-auto pr-1 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <div className="size-2 rounded-full bg-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  <Skeleton className="h-4 w-12 rounded-md" />
                </div>
                <div className="text-xs text-muted-foreground">
                  <Skeleton className="h-4 w-12 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
