"use client";

import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SeverityLevel } from "./get-severity";
import type {
  SiembraRetrasadaDto,
  FaltaGerminacionDto,
  FaltantePlantasDto,
  FaltaPreExpedicionDto,
} from "@vivero/shared";
import { SiembraRetrasadaCard } from "../v2/SiembraRetrasadaCard";
import { FaltaGerminacionCard } from "../v2/FaltaGerminacionCard";
import { FaltantePlantasCard } from "../v2/FaltantePlantasCard";
import { FaltaPreExpedicionCard } from "../v2/FaltaPreExpedicionCard";

interface AlertDetailData {
  id: string;
  severity: SeverityLevel;
  type: "siembra" | "germinacion" | "faltante" | "pre-expedicion";
  partidaId: number;
  indice: number;
  codigoEspecie: string;
  nombreEspecie: string;
}

interface AlertDetailPanelProps {
  selected: AlertDetailData | null;
  onBack: () => void;
  siembraRetrasada: SiembraRetrasadaDto[];
  faltaGerminacion: FaltaGerminacionDto[];
  faltantePlantas: FaltantePlantasDto[];
  faltaPreExpedicion: FaltaPreExpedicionDto[];
  onDismissSiembra: (partidaId: number, indice: number, action: "sembrada" | "anulada") => void;
  onDismissGerminacion: (partidaId: number, indice: number) => void;
  onDismissFaltante: (partidaId: number, indice: number) => void;
  onDismissPreExpedicion: (partidaId: number, indice: number) => void;
  className?: string;
}

function renderCard(
  selected: AlertDetailData,
  siembraRetrasada: SiembraRetrasadaDto[],
  faltaGerminacion: FaltaGerminacionDto[],
  faltantePlantas: FaltantePlantasDto[],
  faltaPreExpedicion: FaltaPreExpedicionDto[],
  onDismissSiembra: (partidaId: number, indice: number, action: "sembrada" | "anulada") => void,
  onDismissGerminacion: (partidaId: number, indice: number) => void,
  onDismissFaltante: (partidaId: number, indice: number) => void,
  onDismissPreExpedicion: (partidaId: number, indice: number) => void,
) {
  switch (selected.type) {
    case "siembra": {
      const data = siembraRetrasada.find(
        (a) => a.partidaId === selected.partidaId && a.indice === selected.indice,
      );
      if (!data) return null;
      return (
        <SiembraRetrasadaCard
          alerta={data}
          onDismiss={(action) => onDismissSiembra(data.partidaId, data.indice, action)}
        />
      );
    }
    case "germinacion": {
      const data = faltaGerminacion.find(
        (a) => a.partidaId === selected.partidaId && a.indice === selected.indice,
      );
      if (!data) return null;
      return (
        <FaltaGerminacionCard
          alerta={data}
          onDismiss={() => onDismissGerminacion(data.partidaId, data.indice)}
        />
      );
    }
    case "faltante": {
      const data = faltantePlantas.find(
        (a) => a.partidaId === selected.partidaId && a.indice === selected.indice,
      );
      if (!data) return null;
      return (
        <FaltantePlantasCard
          alerta={data}
          onDismiss={() => onDismissFaltante(data.partidaId, data.indice)}
        />
      );
    }
    case "pre-expedicion": {
      const data = faltaPreExpedicion.find(
        (a) => a.partidaId === selected.partidaId && a.indice === selected.indice,
      );
      if (!data) return null;
      return (
        <FaltaPreExpedicionCard
          alerta={data}
          onDismiss={() => onDismissPreExpedicion(data.partidaId, data.indice)}
        />
      );
    }
  }
}

export function AlertDetailPanel({
  selected,
  onBack,
  siembraRetrasada,
  faltaGerminacion,
  faltantePlantas,
  faltaPreExpedicion,
  onDismissSiembra,
  onDismissGerminacion,
  onDismissFaltante,
  onDismissPreExpedicion,
  className,
}: AlertDetailPanelProps) {
  if (!selected) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 py-16 text-center h-full",
          className,
        )}
      >
        <div className="p-4 rounded-full bg-muted">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Ninguna alerta seleccionada</p>
          <p className="text-xs text-muted-foreground mt-1">
            Seleccioná una alerta de la lista para ver sus detalles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-7 px-1.5 -ml-1.5 cursor-pointer"
          aria-label="Volver a la lista"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-black text-sm text-foreground/80 tracking-tight whitespace-nowrap">
            #{selected.partidaId}
            {selected.indice !== 0 && ` / ${selected.indice}`}
          </span>
          <span className="font-mono font-bold text-xs text-muted-foreground">
            {selected.codigoEspecie}
          </span>
          <span className="text-xs text-muted-foreground truncate hidden sm:inline">
            {selected.nombreEspecie}
          </span>
        </div>
      </div>

      {renderCard(
        selected,
        siembraRetrasada,
        faltaGerminacion,
        faltantePlantas,
        faltaPreExpedicion,
        onDismissSiembra,
        onDismissGerminacion,
        onDismissFaltante,
        onDismissPreExpedicion,
      )}
    </div>
  );
}
