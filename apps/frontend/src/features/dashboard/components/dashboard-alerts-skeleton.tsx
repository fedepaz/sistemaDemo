// src/features/dashboard/components/dashboard-alerts-skeleton.tsx

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

export function DashboardAlertsSkeleton() {
  function content(id: string) {
    return (
      <div className="space-y-3" key={id}>
        <div className="flex items-start gap-3 rounded-lg border p-3">
          <Badge variant="secondary" className="mt-0.5">
            <Skeleton className="h-4 w-12 rounded-md" />
          </Badge>
          <div className="flex-1">
            <div className="text-sm font-medium">
              <Skeleton className="h-4 w-12 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-5" />
          <Skeleton className="h-4 w-12 rounded-md" />
          <Skeleton className="h-4 w-8 rounded-md" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-32 rounded-md" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        {Array.from({ length: 3 }).map((_, i) => content(i.toString()))}
      </CardContent>
    </Card>
  );
}
