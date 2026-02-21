//src/features/dashboard/components/dashboard-kpi.tsx
"use client";

import { useDashboardKPIs, useForecastKPIs } from "../hooks/hooks";
import { Calendar, Droplets, Sun, Thermometer, Wind } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const climateIcons: Record<string, React.ReactNode> = {
  Temperatura: <Thermometer className="h-5 w-5" />,
  Humedad: <Droplets className="h-5 w-5" />,
  Amanecer: <Sun className="h-5 w-5" />,
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
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-center px-1">
          {/* Left: Date header */}
          <div className="bg-secondary px-2 py-2 lg:rounded-l-lg shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center">
                <Calendar className="h-3.5 w-3.5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-foreground capitalize">
                  {formattedDate}
                </p>
              </div>
            </div>
          </div>

          {/* Middle: Current conditions - grid 2x2 on mobile, flex on desktop */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 px-4 py-3 flex-1">
            {data.map((kpi, index) => {
              const colors = kpiChartColors[index % kpiChartColors.length];
              return (
                <div
                  key={kpi.label}
                  className={cn(
                    colors.bg,
                    "rounded-lg px-3 py-2 flex items-center gap-2 sm:shrink-0",
                  )}
                >
                  <div className={`${colors.icon} [&>svg]:h-4 [&>svg]:w-4`}>
                    {climateIcons[kpi.label]}
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className={`text-lg font-bold ${colors.text}`}>
                      {kpi.value}
                    </span>
                    <span
                      className={`text-[10px] font-medium ${colors.text} opacity-70`}
                    >
                      {kpi.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Forecast - compact horizontal, 3 days on mobile */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 border-t lg:border-t-0 lg:border-l border-border shrink-0">
            {forecastData.map((day, index) => {
              const today = isToday(day.date);
              const past = isPast(day.date);
              const todayIndex = forecastData.findIndex((d) => isToday(d.date));
              const isRelevant = Math.abs(index - todayIndex) <= 1;

              return (
                <div
                  key={index}
                  className={cn(
                    "relative rounded-md px-4 py-1 text-center shrink-0",
                    !isRelevant && "hidden md:block",
                    today
                      ? "bg-primary text-primary-foreground"
                      : past
                        ? "opacity-50"
                        : "bg-muted/30",
                  )}
                >
                  <p
                    className={`text-[9px] font-medium ${today ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                  >
                    {day.date.toLocaleDateString("es-AR", { weekday: "short" })}
                  </p>
                  <p
                    className={`text-xs font-bold ${today ? "text-primary-foreground" : "text-foreground"}`}
                  >
                    {Math.round(day.maxTemp)}°
                  </p>
                  <p
                    className={`text-[9px] ${today ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                  >
                    {Math.round(day.minTemp)}°
                  </p>
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
