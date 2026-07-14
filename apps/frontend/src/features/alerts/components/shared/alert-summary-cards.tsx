// src/features/alerts/components/alert-summary-cards.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  FlaskConical,
  Sprout,
  Truck,
} from "lucide-react";

interface AlertSummaryCardsProps {
  siembraRetrasadaCount: number;
  faltaGerminacionCount: number;
  faltantePlantasCount: number;
  faltaPreExpedicionCount: number;
}

const ALERT_CONFIG = [
  {
    key: "siembraRetrasada",
    title: "Siembra Retrasada",
    description: "Partidas que no se han sembrado en la semana programada",
    icon: AlertTriangle,
    severity: "warning" as const,
    colorClass: "text-warning bg-warning/10 border-warning/20",
  },
  {
    key: "faltaGerminacion",
    title: "Falta Recuento Germinación",
    description: "Partidas que estando en fecha no cuentan con dato de germinación",
    icon: FlaskConical,
    severity: "info" as const,
    colorClass: "text-info bg-info/10 border-info/20",
  },
  {
    key: "faltantePlantas",
    title: "Faltante Estimado de Plantas",
    description: "Partidas donde plantas germinadas son menor a las solicitadas",
    icon: Sprout,
    severity: "warning" as const,
    colorClass: "text-warning bg-warning/10 border-warning/20",
  },
  {
    key: "faltaPreExpedicion",
    title: "Falta Pre-Expedición",
    description: "Partidas sin pre-expedición cargada",
    icon: Truck,
    severity: "info" as const,
    colorClass: "text-info bg-info/10 border-info/20",
  },
];

export function AlertSummaryCards({
  siembraRetrasadaCount,
  faltaGerminacionCount,
  faltantePlantasCount,
  faltaPreExpedicionCount,
}: AlertSummaryCardsProps) {
  const counts: Record<string, number> = {
    siembraRetrasada: siembraRetrasadaCount,
    faltaGerminacion: faltaGerminacionCount,
    faltantePlantas: faltantePlantasCount,
    faltaPreExpedicion: faltaPreExpedicionCount,
  };

  return (
    <TooltipProvider>
      <div
        role="region"
        aria-label="Resumen de alertas"
        className="grid gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-4"
      >
        {ALERT_CONFIG.map((alert) => {
          const count = counts[alert.key];
          const Icon = alert.icon;
          return (
            <Tooltip key={alert.key}>
              <TooltipTrigger asChild>
                <Card
                  className={`border ${alert.colorClass} shadow-sm`}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${alert.colorClass} shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {alert.title}
                      </p>
                      <p className="text-2xl font-black">{count}</p>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-popover border-border shadow-xl">
                <p className="text-xs text-muted-foreground">{alert.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
