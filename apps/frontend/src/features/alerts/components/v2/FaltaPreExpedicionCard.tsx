// src/features/alerts/components/v2/FaltaPreExpedicionCard.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Truck } from "lucide-react";
import type { FaltaPreExpedicionDto } from "@vivero/shared";

interface FaltaPreExpedicionCardProps {
  alerta: FaltaPreExpedicionDto;
}

export function FaltaPreExpedicionCard({ alerta }: FaltaPreExpedicionCardProps) {
  return (
    <Card className="border border-info/20 bg-info/5 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-foreground/80 tracking-tight">
                #{alerta.partidaId}
                {alerta.indice !== 0 && `/ ${alerta.indice}`}
              </span>
              <Badge variant="outline" className="text-[10px] border-info/40 text-info bg-info/10">
                <Truck className="h-3 w-3 mr-1" />
                Pre-expedición faltante
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono font-bold">{alerta.codigoEspecie}</span>
              {" — "}
              {alerta.nombreEspecie}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Fecha entrega</p>
            <p className="font-mono font-bold">{alerta.fechaEntrega}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Invernadero</p>
            <p className="font-semibold">{alerta.invernadero}</p>
          </div>
        </div>

        <div className="text-[10px] text-muted-foreground bg-muted/30 rounded px-2 py-1">
          Se activa miércoles de la semana anterior a la fecha de entrega
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" className="w-full text-xs">
                <Truck className="h-3 w-3 mr-1" />
                Cargar Datos de Pre-expedición
              </Button>
            </TooltipTrigger>
            <TooltipContent>Registrar datos de pre-expedición</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
