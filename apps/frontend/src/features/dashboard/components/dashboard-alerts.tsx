//src/features/dashboard/components/dashboard-alerts.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardAlerts } from "../hooks/hooks";
import { DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);
}

function DashboardAlerts() {
  const { data: currencyRates } = useDashboardAlerts();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cotizaciones
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            Actualizado
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currencyRates.map((currency) => (
          <div
            key={currency.code}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {currency.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Compra: {formatCurrency(currency.buyRate)}</span>
                <span className="text-border">|</span>
                <span>Venta: {formatCurrency(currency.sellRate)}</span>
              </div>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground text-center pt-2">
          Cotizaciones en Pesos Argentinos (ARS)
        </p>
      </CardContent>
    </Card>
  );
}

export default DashboardAlerts;
