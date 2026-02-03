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

function getTemperatureGradient(maxTemp: number): string {
  if (maxTemp >= 30) return "from-orange-500 to-red-500";
  if (maxTemp >= 25) return "from-amber-400 to-orange-500";
  if (maxTemp >= 20) return "from-yellow-400 to-amber-500";
  if (maxTemp >= 15) return "from-emerald-400 to-yellow-500";
  return "from-sky-400 to-emerald-500";
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
    <Card className="mb-1 overflow-hidden">
      {/* Header with current date */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white capitalize">
              {formattedDate}
            </h2>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Current Conditions */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Condiciones Actuales
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {data.map((kpi) => {
              const colors = climateColors[kpi.label] || {
                bg: "bg-muted",
                text: "text-foreground",
                icon: "text-muted-foreground",
              };
              return (
                <div
                  key={kpi.label}
                  className={`${colors.bg} rounded-xl p-4 transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-medium ${colors.text} uppercase tracking-wide`}
                    >
                      {kpi.label}
                    </span>
                    <div className={colors.icon}>{climateIcons[kpi.label]}</div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${colors.text}`}>
                      {kpi.value}
                    </span>
                    <span
                      className={`text-sm font-medium ${colors.text} opacity-70`}
                    >
                      {kpi.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forecast Section */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Pronóstico Extendido
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {forecastData.map((day, index) => {
              const today = isToday(day.date);
              const past = isPast(day.date);
              const gradient = getTemperatureGradient(day.maxTemp);

              return (
                <div
                  key={index}
                  className={`relative rounded-xl p-4 text-center transition-all ${
                    today
                      ? "bg-gradient-to-br from-slate-800 to-slate-700 text-white ring-2 ring-slate-600 ring-offset-2"
                      : past
                        ? "bg-muted/50 opacity-60"
                        : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  {/* Today badge */}
                  {today && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                        Hoy
                      </span>
                    </div>
                  )}

                  {/* Day name */}
                  <p
                    className={`text-xs font-medium mb-2 ${
                      today ? "text-slate-300" : "text-muted-foreground"
                    }`}
                  >
                    {day.date.toLocaleDateString("es-AR", { weekday: "short" })}
                  </p>

                  {/* Date number */}
                  <p
                    className={`text-lg font-bold mb-3 ${
                      today ? "text-white" : "text-foreground"
                    }`}
                  >
                    {day.date.getDate()}
                  </p>

                  {/* Temperature bar */}
                  <div className="h-16 w-2 mx-auto rounded-full bg-muted/50 mb-3 overflow-hidden relative">
                    <div
                      className={`absolute bottom-0 w-full rounded-full bg-gradient-to-t ${gradient}`}
                      style={{
                        height: `${Math.min(100, Math.max(20, ((day.maxTemp + 10) / 50) * 100))}%`,
                      }}
                    />
                  </div>

                  {/* Max/Min temps */}
                  <div className="space-y-0.5">
                    <p
                      className={`text-sm font-bold ${
                        today ? "text-white" : "text-foreground"
                      }`}
                    >
                      {Math.round(day.maxTemp)}°
                    </p>
                    <p
                      className={`text-xs ${
                        today ? "text-slate-400" : "text-muted-foreground"
                      }`}
                    >
                      {Math.round(day.minTemp)}°
                    </p>
                  </div>
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
