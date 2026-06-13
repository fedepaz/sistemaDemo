//src/features/dashboard/components/dashboard-alerts.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardAlerts } from "../hooks/hooks";
import { DollarSign, RefreshCw } from "lucide-react";

const chartColors = [
  {
    bg: "bg-chart-1/10",
    text: "text-chart-1",
    accent: "bg-chart-1",
    icon: "text-chart-1",
  },
  {
    bg: "bg-chart-2/10",
    text: "text-chart-2",
    accent: "bg-chart-2",
    icon: "text-chart-2",
  },
  {
    bg: "bg-chart-3/10",
    text: "text-chart-3",
    accent: "bg-chart-3",
    icon: "text-chart-3",
  },
  {
    bg: "bg-chart-4/10",
    text: "text-chart-4",
    accent: "bg-chart-4",
    icon: "text-chart-4",
  },
  {
    bg: "bg-chart-5/10",
    text: "text-chart-5",
    accent: "bg-chart-5",
    icon: "text-chart-5",
  },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function DashboardAlerts() {
  const { data: currencyRates } = useDashboardAlerts();

  const currentTime = new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="overflow-hidden flex flex-col border-border/40 shadow-sm h-full">
      {/* Header - professional gradient using theme tokens */}
      <div className="bg-gradient-to-r from-primary/90 to-primary px-2 py-1.5 sm:px-3 sm:py-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm shrink-0">
              <DollarSign className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-[11px] sm:text-xs font-bold text-primary-foreground tracking-tight">
                Cotizaciones
              </h2>
              <p className="text-[8px] sm:text-[9px] text-primary-foreground/70 font-medium leading-none">ARS • En Vivo</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-primary-foreground/60 text-[8px] sm:text-[9px] font-bold">
            <RefreshCw className="h-2 w-2 animate-spin-slow" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-1.5 sm:p-2 flex-1 overflow-auto bg-card">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {currencyRates.map((currency, index) => {
            const colors = chartColors[index % chartColors.length];

            return (
              <div
                key={currency.code}
                className={`${colors.bg} rounded-lg p-1.5 sm:p-2 transition-all hover:scale-[1.01] cursor-pointer group flex flex-col justify-center border border-transparent hover:border-border`}
              >
                {/* Currency Header */}
                <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`h-4 w-4 sm:h-5 sm:w-5 rounded-md ${colors.accent} flex items-center justify-center shadow-sm shrink-0`}
                    >
                      <span className="text-primary-foreground text-[8px] sm:text-[9px] font-black">
                        {currency.code === "BLUE"
                          ? "B"
                          : currency.code.charAt(0)}
                      </span>
                    </div>
                    <p className={`text-[9px] sm:text-[10px] font-bold ${colors.text} uppercase tracking-tight truncate`}>
                      {currency.name}
                    </p>
                  </div>
                </div>

                {/* Buy/Sell Rates */}
                <div className="flex gap-1">
                  <div className="bg-background/80 dark:bg-background/40 rounded-md px-1.5 py-0.5 sm:px-2 sm:py-1 text-center flex-1 border border-border/50">
                    <p
                      className={`text-[7px] sm:text-[8px] font-bold ${colors.text} opacity-60 uppercase tracking-widest leading-none mb-0.5`}
                    >
                      Compra
                    </p>
                    <p className={`text-xs sm:text-sm font-black ${colors.text}`}>
                      ${formatNumber(currency.buyRate)}
                    </p>
                  </div>
                  <div className="bg-background/80 dark:bg-background/40 rounded-md px-1.5 py-0.5 sm:px-2 sm:py-1 text-center flex-1 border border-border/50">
                    <p
                      className={`text-[7px] sm:text-[8px] font-bold ${colors.text} opacity-60 uppercase tracking-widest leading-none mb-0.5`}
                    >
                      Venta
                    </p>
                    <p className={`text-xs sm:text-sm font-black ${colors.text}`}>
                      ${formatNumber(currency.sellRate)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardAlerts;
