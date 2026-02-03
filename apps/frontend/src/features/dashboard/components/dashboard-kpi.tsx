//src/features/dashboard/components/dashboard-kpi.tsx
"use client";

import { useDashboardKPIs, useForecastKPIs } from "../hooks/hooks";
import { Calendar, Droplets, Sun, Thermometer, Wind } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const climateIcons: Record<string, React.ReactNode> = {
  Temperatura: <Thermometer className="h-5 w-5" />,
  Humedad: <Droplets className="h-5 w-5" />,
  Amanecer: <Sun className="h-5 w-5" />,
  Viento: <Wind className="h-5 w-5" />,
};

const climateColors: Record<
  string,
  { bg: string; text: string; icon: string }
> = {
  Temperatura: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: "text-amber-500",
  },
  Humedad: { bg: "bg-sky-50", text: "text-sky-700", icon: "text-sky-500" },
  Amanecer: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    icon: "text-yellow-500",
  },
  Viento: { bg: "bg-teal-50", text: "text-teal-700", icon: "text-teal-500" },
};

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
        <div className="flex flex-col lg:flex-row lg:items-center">
          {/* Left: Date header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-2.5 lg:rounded-l-lg shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center">
                <Calendar className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white capitalize">
                  {formattedDate}
                </p>
                <p className="text-[10px] text-slate-300">Clima actual</p>
              </div>
            </div>
          </div>

          {/* Middle: Current conditions - inline */}
          <div className="flex items-center gap-2 px-4 py-2 flex-1 overflow-x-auto">
            {data.map((kpi) => {
              const colors = climateColors[kpi.label] || {
                bg: "bg-muted",
                text: "text-foreground",
                icon: "text-muted-foreground",
              };
              return (
                <div
                  key={kpi.label}
                  className={`${colors.bg} rounded-lg px-3 py-2 flex items-center gap-2 shrink-0`}
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

          {/* Right: Forecast - compact horizontal */}
          <div className="flex items-center gap-1 px-4 py-2 border-t lg:border-t-0 lg:border-l border-border shrink-0 overflow-x-auto">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mr-1 shrink-0">
              Pronóstico
            </span>
            {forecastData.map((day, index) => {
              const today = isToday(day.date);
              const past = isPast(day.date);

              return (
                <div
                  key={index}
                  className={`relative rounded-md px-2 py-1 text-center shrink-0 ${
                    today
                      ? "bg-slate-800 text-white"
                      : past
                        ? "opacity-50"
                        : "bg-muted/30"
                  }`}
                >
                  <p
                    className={`text-[9px] font-medium ${today ? "text-slate-300" : "text-muted-foreground"}`}
                  >
                    {day.date.toLocaleDateString("es-AR", { weekday: "short" })}
                  </p>
                  <p
                    className={`text-xs font-bold ${today ? "text-white" : "text-foreground"}`}
                  >
                    {Math.round(day.maxTemp)}°
                  </p>
                  <p
                    className={`text-[9px] ${today ? "text-slate-400" : "text-muted-foreground"}`}
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
