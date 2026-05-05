//src/features/dashboard/components/dashboard-kpi.tsx
"use client";

import { useDashboardKPIs, useForecastKPIs } from "../hooks/hooks";
import { Droplets, CloudRain, Thermometer, Wind } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const climateIcons: Record<string, React.ReactNode> = {
  Temperatura: <Thermometer className="h-5 w-5" />,
  Humedad: <Droplets className="h-5 w-5" />,
  Lluvia: <CloudRain className="h-5 w-5" />,
  Viento: <Wind className="h-5 w-5" />,
};

const kpiChartColors = [
  { bg: "bg-chart-1/10", text: "text-chart-1", icon: "text-chart-1" },
  { bg: "bg-chart-2/10", text: "text-chart-2", icon: "text-chart-2" },
  { bg: "bg-chart-3/10", text: "text-chart-3", icon: "text-chart-3" },
  { bg: "bg-chart-4/10", text: "text-chart-4", icon: "text-chart-4" },
];

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
}

function DashboardKPI() {
  const { data } = useDashboardKPIs();
  const { data: forecastData } = useForecastKPIs();

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm bg-card">
      <CardContent className="p-0">
        <div className="flex flex-col 2xl:flex-row 2xl:items-center px-0.5 sm:px-1">
          {/* Middle: Current conditions */}
          <div className="grid grid-cols-2 md:grid-cols-4 2xl:flex 2xl:flex-nowrap items-center gap-2 sm:gap-4 px-3 py-3 sm:px-6 sm:py-4 flex-1 min-w-0">
            {data.map((kpi, index) => {
              const colors = kpiChartColors[index % kpiChartColors.length];
              return (
                <div
                  key={kpi.label}
                  className={cn(
                    colors.bg,
                    "rounded-xl sm:rounded-2xl px-3 py-2.5 sm:px-5 sm:py-3.5 flex items-center gap-3 sm:gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-transparent hover:border-border/50 min-w-0 flex-1",
                  )}
                >
                  <div
                    className={cn(
                      colors.icon,
                      "h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-background/50 flex items-center justify-center shrink-0 shadow-sm",
                    )}
                  >
                    <div className="[&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-6 sm:[&>svg]:w-6 drop-shadow-sm">
                      {climateIcons[kpi.label]}
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 justify-center">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground/70 truncate mb-0.5">
                      {kpi.label}
                    </span>
                    <div className="flex items-baseline gap-1 min-w-0">
                      <span
                        className={cn(
                          "text-lg sm:text-2xl font-black tracking-tighter leading-none truncate",
                          colors.text,
                        )}
                      >
                        {kpi.value}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs font-bold opacity-70 shrink-0",
                          colors.text,
                        )}
                      >
                        {kpi.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Forecast */}
          <div className="flex items-center justify-center sm:justify-center gap-1 sm:gap-4 px-3 py-3 sm:px-8 sm:py-4 border-t xl:border-t-0 xl:border-l border-border/50 shrink-0 bg-muted/5 overflow-x-auto w-full xl:w-auto scrollbar-hide">
            {forecastData.map((day, index) => {
              const today = isToday(day.date);
              const past = isPast(day.date);

              return (
                <div
                  key={index}
                  className={cn(
                    "relative rounded-lg sm:rounded-xl px-3 py-2 sm:px-5 sm:py-3 text-center shrink-0 transition-all cursor-pointer hover:shadow-md",
                    today
                      ? "bg-primary text-primary-foreground shadow-lg scale-105 sm:scale-110 z-10"
                      : past
                        ? "opacity-30 grayscale blur-[0.5px]"
                        : "bg-background border border-border/60 hover:border-primary/50",
                  )}
                >
                  <p
                    className={cn(
                      "text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2",
                      today
                        ? "text-primary-foreground/90"
                        : "text-muted-foreground",
                    )}
                  >
                    {day.date.toLocaleDateString("es-AR", { weekday: "short" })}
                  </p>
                  <div className="flex flex-col gap-0">
                    <p
                      className={cn(
                        "text-sm sm:text-base font-black tracking-tighter",
                        today ? "text-white" : "text-foreground",
                      )}
                    >
                      {Math.round(day.maxTemp)}°
                    </p>
                    <p
                      className={cn(
                        "text-[10px] sm:text-[11px] font-bold",
                        today
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground/60",
                      )}
                    >
                      {Math.round(day.minTemp)}°
                    </p>
                  </div>
                  {today && (
                    <div className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-background rounded-full border border-primary animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default DashboardKPI;
