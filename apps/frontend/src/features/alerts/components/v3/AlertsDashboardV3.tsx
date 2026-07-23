"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useBreakpoint } from "@/hooks/useMediaQuery";
import { AlertDashboardSkeleton } from "../shared/alert-dashboard-skeleton";
import { AlertListPanel, type AlertListItem } from "./alert-list-panel";
import { AlertDetailPanel } from "./alert-detail-panel";
import { getSeverity } from "./get-severity";
import {
  useSiembraRetrasada,
  useFaltaGerminacion,
  useFaltantePlantas,
  useFaltaPreExpedicion,
} from "../../hooks/useAlerts";
import { useAlertActions } from "../../hooks/useAlertActions";
import { cn } from "@/lib/utils";

function getStatLine(
  type: AlertListItem["type"],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): string {
  switch (type) {
    case "siembra":
      return `Siembra sugerida: ${data.fechaSugeridaSiembra}`;
    case "germinacion":
      return "Esperando recuento";
    case "faltante": {
      const deficit = data.solicitadas - data.germinadasTotales;
      return `Faltante: ${deficit} plantas`;
    }
    case "pre-expedicion":
      return `Entrega: ${data.fechaEntrega}`;
  }
}

function AlertsContent() {
  const { data: siembraRetrasada } = useSiembraRetrasada();
  const { data: faltaGerminacion } = useFaltaGerminacion();
  const { data: faltantePlantas } = useFaltantePlantas();
  const { data: faltaPreExpedicion } = useFaltaPreExpedicion();
  const actions = useAlertActions();
  const breakpoint = useBreakpoint();
  const isDesktop =
    breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl";

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const allAlerts: AlertListItem[] = useMemo(() => {
    const items: AlertListItem[] = [];

    siembraRetrasada.forEach((a) => {
      items.push({
        id: `siembra-${a.partidaId}-${a.indice}`,
        severity: getSeverity(a),
        type: "siembra",
        partidaId: a.partidaId,
        indice: a.indice,
        codigoEspecie: a.codigoEspecie,
        nombreEspecie: a.nombreEspecie,
        statLine: getStatLine("siembra", a),
      });
    });

    faltaGerminacion.forEach((a) => {
      items.push({
        id: `germinacion-${a.partidaId}-${a.indice}`,
        severity: getSeverity(a),
        type: "germinacion",
        partidaId: a.partidaId,
        indice: a.indice,
        codigoEspecie: a.codigoEspecie,
        nombreEspecie: a.nombreEspecie,
        statLine: getStatLine("germinacion", a),
      });
    });

    faltantePlantas.forEach((a) => {
      items.push({
        id: `faltante-${a.partidaId}-${a.indice}`,
        severity: getSeverity(a),
        type: "faltante",
        partidaId: a.partidaId,
        indice: a.indice,
        codigoEspecie: a.codigoEspecie,
        nombreEspecie: a.nombreEspecie,
        statLine: getStatLine("faltante", a),
      });
    });

    faltaPreExpedicion.forEach((a) => {
      items.push({
        id: `pre-expedicion-${a.partidaId}-${a.indice}`,
        severity: getSeverity(a),
        type: "pre-expedicion",
        partidaId: a.partidaId,
        indice: a.indice,
        codigoEspecie: a.codigoEspecie,
        nombreEspecie: a.nombreEspecie,
        statLine: getStatLine("pre-expedicion", a),
      });
    });

    return items;
  }, [siembraRetrasada, faltaGerminacion, faltantePlantas, faltaPreExpedicion]);

  const totalAlerts = allAlerts.length;

  const selectedAlert = useMemo(() => {
    if (!selectedId) return null;
    return allAlerts.find((a) => a.id === selectedId) ?? null;
  }, [selectedId, allAlerts]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    if (!isDesktop) setMobileSheetOpen(true);
  }, [isDesktop]);

  const handleBack = useCallback(() => {
    setSelectedId(null);
    setMobileSheetOpen(false);
  }, []);

  const handleDismissAndClose = useCallback(
    (handler: () => void) => {
      handler();
      setSelectedId(null);
      if (!isDesktop) setMobileSheetOpen(false);
    },
    [isDesktop],
  );

  if (totalAlerts === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="p-3 rounded-full bg-muted">
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">No hay alertas activas</p>
          <p className="text-xs text-muted-foreground mt-1">
            Todas las partidas están dentro de los parámetros esperados
          </p>
        </div>
      </div>
    );
  }

  const detailPanel = (
    <AlertDetailPanel
      selected={selectedAlert}
      onBack={handleBack}
      siembraRetrasada={siembraRetrasada}
      faltaGerminacion={faltaGerminacion}
      faltantePlantas={faltantePlantas}
      faltaPreExpedicion={faltaPreExpedicion}
      onDismissSiembra={(pid, idx, action) =>
        handleDismissAndClose(() => actions.dismissSiembra(pid, idx, action))
      }
      onDismissGerminacion={(pid, idx) =>
        handleDismissAndClose(() => actions.dismissGerminacion(pid, idx))
      }
      onDismissFaltante={(pid, idx) =>
        handleDismissAndClose(() => actions.dismissFaltante(pid, idx))
      }
      onDismissPreExpedicion={(pid, idx) =>
        handleDismissAndClose(() => actions.dismissPreExpedicion(pid, idx))
      }
    />
  );

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between shrink-0">
        <p className="text-xs font-bold text-muted-foreground">
          <span className="font-black text-foreground text-sm">{totalAlerts}</span> alertas activas
        </p>
        {selectedAlert && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-7 text-xs gap-1 lg:hidden cursor-pointer"
          >
            <X className="h-3 w-3" />
            Cerrar
          </Button>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-0 lg:gap-4 overflow-hidden min-h-0">
        <div className="overflow-y-auto border border-border/40 rounded-xl bg-card/30 p-2 hidden lg:block">
          <AlertListPanel
            alerts={allAlerts}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>

        <div className={cn("overflow-y-auto hidden lg:block w-full", !selectedAlert && "flex items-center justify-center")}>
          {detailPanel}
        </div>
      </div>

      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <div className="lg:hidden">
          <AlertListPanel
            alerts={allAlerts}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>
        <SheetContent side="bottom" className="h-[85dvh] rounded-t-2xl">
          {detailPanel}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function AlertsDashboardV3() {
  return (
    <Suspense fallback={<AlertDashboardSkeleton />}>
      <AlertsContent />
    </Suspense>
  );
}
