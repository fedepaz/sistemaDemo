// src/features/alerts/components/alert-summary-cards.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ALERT_TYPE_CONFIGS } from "../v1/alert-type-config";
import type { AlertType } from "@/features/alerts/types";

interface AlertSummaryCardsProps {
  siembraRetrasadaCount: number;
  faltaGerminacionCount: number;
  faltantePlantasCount: number;
  faltaPreExpedicionCount: number;
}

const ALERT_TYPE_ORDER: AlertType[] = [
  "SIEMBRA_RETRASADA",
  "FALTA_GERMINACION",
  "FALTANTE_PLANTAS",
  "FALTA_PRE_EXPEDICION",
];

const DESCRIPTIONS: Record<AlertType, string> = {
  SIEMBRA_RETRASADA: "Partidas que no se han sembrado en la semana programada",
  FALTA_GERMINACION:
    "Partidas que estando en fecha no cuentan con dato de germinación",
  FALTANTE_PLANTAS:
    "Partidas donde plantas germinadas son menor a las solicitadas",
  FALTA_PRE_EXPEDICION: "Partidas sin pre-expedición cargada",
};

export function AlertSummaryCards({
  siembraRetrasadaCount,
  faltaGerminacionCount,
  faltantePlantasCount,
  faltaPreExpedicionCount,
}: AlertSummaryCardsProps) {
  const counts: Record<AlertType, number> = {
    SIEMBRA_RETRASADA: siembraRetrasadaCount,
    FALTA_GERMINACION: faltaGerminacionCount,
    FALTANTE_PLANTAS: faltantePlantasCount,
    FALTA_PRE_EXPEDICION: faltaPreExpedicionCount,
  };

  return (
    <TooltipProvider>
      <div
        role="region"
        aria-label="Resumen de alertas"
        className="grid gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-4"
      >
        {ALERT_TYPE_ORDER.map((alertType) => {
          const config = ALERT_TYPE_CONFIGS[alertType];
          const count = counts[alertType];
          const Icon = config.icon;
          const colorClass = `${config.color} ${config.bgColor} ${config.borderColor}`;
          return (
            <Tooltip key={alertType}>
              <TooltipTrigger asChild>
                <Card className={`border ${colorClass} shadow-sm`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-lg ${colorClass} shrink-0`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {config.label}
                      </p>
                      <p className="text-2xl font-black">{count}</p>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-popover border-border shadow-xl"
              >
                <p className="text-xs text-muted-foreground">
                  {DESCRIPTIONS[alertType]}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
