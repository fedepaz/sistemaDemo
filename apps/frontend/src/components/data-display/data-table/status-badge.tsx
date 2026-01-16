import type React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status:
    | "healthy"
    | "warning"
    | "critical"
    | "info"
    | "active"
    | "inactive"
    | "pending"
    | "completed";
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const statusStyles = {
    healthy:
      "bg-chart-2/10 text-chart-2 border-chart-2/20 dark:bg-chart-2/10 dark:text-chart-2 dark:border-chart-2/20",
    warning:
      "bg-chart-5/10 text-chart-5 border-chart-5/20 dark:bg-chart-5/10 dark:text-chart-5 dark:border-chart-5/20",
    critical:
      "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/10 dark:text-destructive dark:border-destructive/20",
    info: "bg-chart-1/10 text-chart-1 border-chart-1/20 dark:bg-chart-1/10 dark:text-chart-1 dark:border-chart-1/20",
    active:
      "bg-chart-2/10 text-chart-2 border-chart-2/20 dark:bg-chart-2/10 dark:text-chart-2 dark:border-chart-2/20",
    inactive:
      "bg-muted text-muted-foreground border-border dark:bg-muted dark:text-muted-foreground dark:border-border",
    pending:
      "bg-chart-5/10 text-chart-5 border-chart-5/20 dark:bg-chart-5/10 dark:text-chart-5 dark:border-chart-5/20",
    completed:
      "bg-chart-2/10 text-chart-2 border-chart-2/20 dark:bg-chart-2/10 dark:text-chart-2 dark:border-chart-2/20",
  };

  return (
    <Badge variant="outline" className={cn(statusStyles[status], className)}>
      {children}
    </Badge>
  );
}
