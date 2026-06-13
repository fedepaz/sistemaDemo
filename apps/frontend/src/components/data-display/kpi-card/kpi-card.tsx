// app/components/data-display/kpi-card/kpi-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function KPICard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: KPICardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 py-2">
        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">{title}</CardTitle>
        {Icon && <Icon className="size-3.5 text-muted-foreground/50" />}
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <div className="text-xl font-black tracking-tight">{value}</div>
        {description && (
          <p className="text-[10px] text-muted-foreground/60 leading-none mt-0.5">{description}</p>
        )}
        {trend && (
          <div className="mt-1 flex items-center gap-1 text-[10px]">
            <span
              className={cn(
                "font-bold",
                trend.isPositive ? "text-primary" : "text-destructive",
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-muted-foreground/60">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
