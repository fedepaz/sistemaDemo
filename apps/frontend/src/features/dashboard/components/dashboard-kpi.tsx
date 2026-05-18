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
        <div className="flex flex-col xl:flex-row xl:items-center px-0.5">
          {/* Middle: Current conditions */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:flex xl:flex-nowrap items-center gap-2 px-2 py-2 flex-1 min-w-0">
            {data.map((kpi, index) => {
              const colors = kpiChartColors[index % kpiChartColors.length];
              return (
                <div
                  key={kpi.label}
                  className={cn(
                    colors.bg,
                    "rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer border border-transparent hover:border-border/50 min-w-0 flex-1",
                  )}
                >
                  <div
                    className={cn(
                      colors.icon,
                      "hidden md:flex h-7 w-7 sm:h-9 sm:w-9 rounded-lg bg-background/50 items-center justify-center shrink-0 shadow-sm",
                    )}
                  >
                    <div className="[&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-5 sm:[&>svg]:w-5 drop-shadow-sm">
                      {climateIcons[kpi.label]}
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 justify-center">
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground/70 truncate">
                      {kpi.label}
                    </span>
                    <div className="flex items-baseline gap-1 min-w-0">
                      <span
                        className={cn(
                          "text-base sm:text-xl font-black tracking-tighter leading-none truncate",
                          colors.text,
                        )}
                      >
                        {kpi.value}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] sm:text-[10px] font-bold opacity-70 shrink-0",
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
          <div className="flex items-center justify-center gap-1.5 px-2 py-2 border-t xl:border-t-0 xl:border-l border-border/50 shrink-0 bg-muted/5 overflow-x-auto w-full xl:w-auto scrollbar-hide">
            {forecastData.map((day, index) => {
              const today = isToday(day.date);
              const past = isPast(day.date);

              return (
                <div
                  key={index}
                  className={cn(
                    "relative rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-center shrink-0 transition-all cursor-pointer hover:shadow-md",
                    today
                      ? "bg-primary text-primary-foreground shadow-lg scale-105 z-10"
                      : past
                        ? "opacity-30 grayscale blur-[0.5px]"
                        : "bg-background border border-border/60 hover:border-primary/50",
                  )}
                >
                  <p
                    className={cn(
                      "text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5",
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
                        "text-xs sm:text-sm font-black tracking-tighter",
                        today ? "text-white" : "text-foreground",
                      )}
                    >
                      {Math.round(day.maxTemp)}°
                    </p>
                    <p
                      className={cn(
                        "text-[9px] sm:text-[10px] font-bold",
                        today
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground/60",
                      )}
                    >
                      {Math.round(day.minTemp)}°
                    </p>
                  </div>
                  {today && (
                    <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-background rounded-full border border-primary animate-pulse" />
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
