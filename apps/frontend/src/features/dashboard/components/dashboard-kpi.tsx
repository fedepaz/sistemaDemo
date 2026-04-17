//src/features/dashboard/components/dashboard-kpi.tsx
"use client";

import { useDashboardKPIs, useForecastKPIs } from "../hooks/hooks";
import {
  Calendar,
  Droplets,
  CloudRain,
  Thermometer,
  Wind,
} from "lucide-react";
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

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm bg-card">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-center px-1">
          {/* Left: Date header */}
          <div className="bg-muted/30 px-6 py-4 lg:rounded-l-lg shrink-0 border-r border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Mendoza
                </p>
                <p className="text-sm font-bold text-foreground capitalize">
                  {formattedDate}
                </p>
              </div>
            </div>
          </div>

          {/* Middle: Current conditions */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 px-6 py-4 flex-1">
            {data.map((kpi, index) => {
              const colors = kpiChartColors[index % kpiChartColors.length];
              return (
                <div
                  key={kpi.label}
                  className={cn(
                    colors.bg,
                    "rounded-2xl px-5 py-3 flex items-center gap-4 sm:shrink-0 transition-all hover:scale-[1.05] cursor-pointer border border-transparent hover:border-border hover:shadow-lg",
                  )}
                >
                  <div className={`${colors.icon} [&>svg]:h-6 [&>svg]:w-6 drop-shadow-sm`}>
                    {climateIcons[kpi.label]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-50">
                      {kpi.label}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-black tracking-tighter ${colors.text}`}>
                        {kpi.value}
                      </span>
                      <span
                        className={`text-xs font-bold ${colors.text} opacity-60`}
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
          <div className="flex items-center justify-center gap-4 px-8 py-4 border-t lg:border-t-0 lg:border-l border-border/50 shrink-0 bg-muted/5">
            {forecastData.map((day, index) => {
              const today = isToday(day.date);
              const past = isPast(day.date);
              const todayIndex = forecastData.findIndex((d) => isToday(d.date));
              const isRelevant = Math.abs(index - todayIndex) <= 1;

              return (
                <div
                  key={index}
                  className={cn(
                    "relative rounded-xl px-5 py-3 text-center shrink-0 transition-all cursor-pointer hover:shadow-md",
                    !isRelevant && "hidden md:block",
                    today
                      ? "bg-primary text-primary-foreground shadow-lg scale-110 z-10"
                      : past
                        ? "opacity-30 grayscale blur-[0.5px]"
                        : "bg-background border border-border/60 hover:border-primary/50",
                  )}
                >
                  <p
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest mb-2",
                      today ? "text-primary-foreground/90" : "text-muted-foreground",
                    )}
                  >
                    {day.date.toLocaleDateString("es-AR", { weekday: "short" })}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    <p
                      className={cn(
                        "text-base font-black tracking-tighter",
                        today ? "text-white" : "text-foreground",
                      )}
                    >
                      {Math.round(day.maxTemp)}°
                    </p>
                    <p
                      className={cn(
                        "text-[11px] font-bold",
                        today ? "text-primary-foreground/70" : "text-muted-foreground/60",
                      )}
                    >
                      {Math.round(day.minTemp)}°
                    </p>
                  </div>
                  {today && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-background rounded-full border-2 border-primary animate-pulse" />
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
