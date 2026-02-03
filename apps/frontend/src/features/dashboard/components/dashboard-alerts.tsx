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
    <Card className="overflow-hidden flex flex-col">
      {/* Header - compact */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-3 py-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <DollarSign className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-primary-foreground">
                Cotizaciones
              </h2>
              <p className="text-[10px] text-primary-foreground/80">ARS</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-primary-foreground/80 text-[10px]">
            <RefreshCw className="h-2.5 w-2.5" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-2 flex-1 overflow-auto">
        <div className="flex flex-col gap-2 ">
          {currencyRates.map((currency, index) => {
            const colors = chartColors[index % chartColors.length];

            return (
              <div
                key={currency.code}
                className={`${colors.bg} rounded-lg p-2 transition-all hover:scale-[1.01] flex-1 flex flex-col justify-center`}
              >
                {/* Currency Header - inline */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`h-5 w-5 rounded ${colors.accent} flex items-center justify-center`}
                    >
                      <span className="text-white text-[8px] font-bold">
                        {currency.code === "BLUE"
                          ? "B"
                          : currency.code.charAt(0)}
                      </span>
                    </div>
                    <p className={`text-xs font-semibold ${colors.text}`}>
                      {currency.name}
                    </p>
                  </div>
                </div>

                {/* Buy/Sell Rates - compact inline */}
                <div className="flex gap-1.5">
                  <div className="bg-white/60 rounded px-2 py-1 text-center flex-1">
                    <p
                      className={`text-[8px] font-medium ${colors.text} opacity-70 uppercase`}
                    >
                      Compra
                    </p>
                    <p className={`text-sm font-bold ${colors.text}`}>
                      ${formatNumber(currency.buyRate)}
                    </p>
                  </div>
                  <div className="bg-white/60 rounded px-2 py-1 text-center flex-1">
                    <p
                      className={`text-[8px] font-medium ${colors.text} opacity-70 uppercase`}
                    >
                      Venta
                    </p>
                    <p className={`text-sm font-bold ${colors.text}`}>
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
