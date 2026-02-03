//src/features/dashboard/components/dashboard-alerts.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardAlerts } from "../hooks/hooks";
import {
  DollarSign,
  Minus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const currencyColors: Record<
  string,
  { bg: string; text: string; icon: string; accent: string }
> = {
  USD: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: "text-emerald-500",
    accent: "bg-emerald-500",
  },
  BLUE: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    icon: "text-sky-500",
    accent: "bg-sky-500",
  },
  EUR: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    icon: "text-violet-500",
    accent: "bg-violet-500",
  },
};

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
    <Card className="h-full overflow-hidden flex flex-col">
      {/* Header - compact */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-3 py-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
              <DollarSign className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Cotizaciones</h2>
              <p className="text-[10px] text-emerald-100">ARS</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-100 text-[10px]">
            <RefreshCw className="h-2.5 w-2.5" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-2 flex-1 overflow-auto">
        <div className="flex flex-col gap-2 h-full">
          {currencyRates.map((currency) => {
            const colors = currencyColors[currency.code] || currencyColors.USD;

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
