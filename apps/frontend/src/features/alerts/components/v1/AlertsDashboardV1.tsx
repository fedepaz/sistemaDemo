// src/features/alerts/components/v1/AlertsDashboardV1.tsx
"use client";

import { Suspense, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { AlertSummaryCards } from "../shared/alert-summary-cards";
import { AlertsDataTable } from "./alerts-data-table";
import {
  siembraRetrasadaColumns,
  faltaGerminacionColumns,
  faltantePlantasColumns,
  faltaPreExpedicionColumns,
  siembraRetrasadaExportColumns,
  faltaGerminacionExportColumns,
  faltantePlantasExportColumns,
  faltaPreExpedicionExportColumns,
} from "../shared/alert-columns";
import {
  useSiembraRetrasada,
  useFaltaGerminacion,
  useFaltantePlantas,
  useFaltaPreExpedicion,
} from "../../hooks/useAlerts";
import { AlertDashboardSkeleton } from "../shared/alert-dashboard-skeleton";

import type { ExportColumn } from "@/lib/export/types";
import { Separator } from "@/components/ui/separator";

function AlertSection({
  title,
  description,
  alertType,
  columns,
  data,
  exportColumns,
}: {
  title: string;
  description: string;
  count: number;
  alertType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exportColumns?: ExportColumn<any>[];
}) {
  return (
    <AlertsDataTable
      title={title}
      description={description}
      alertType={alertType}
      columns={columns}
      data={data}
      exportColumns={exportColumns}
    />
  );
}

function AlertsContent() {
  const { data: siembraRetrasada } = useSiembraRetrasada();
  const { data: faltaGerminacion } = useFaltaGerminacion();
  const { data: faltantePlantas } = useFaltantePlantas();
  const { data: faltaPreExpedicion } = useFaltaPreExpedicion();

  const totalAlerts =
    siembraRetrasada.length +
    faltaGerminacion.length +
    faltantePlantas.length +
    faltaPreExpedicion.length;

  return (
    <div className="flex flex-col gap-4">
      <AlertSummaryCards
        siembraRetrasadaCount={siembraRetrasada.length}
        faltaGerminacionCount={faltaGerminacion.length}
        faltantePlantasCount={faltantePlantas.length}
        faltaPreExpedicionCount={faltaPreExpedicion.length}
      />

      {totalAlerts === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="p-3 rounded-full bg-muted">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              No hay alertas activas
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Todas las partidas están dentro de los parámetros esperados
            </p>
          </div>
        </div>
      ) : (
        <>
          {siembraRetrasada.length > 0 && (
            <AlertSection
              title="Siembra Retrasada"
              description="Partidas que no se han sembrado en la semana programada"
              count={siembraRetrasada.length}
              alertType="siembra-retrasada"
              columns={siembraRetrasadaColumns}
              data={siembraRetrasada}
              exportColumns={siembraRetrasadaExportColumns}
            />
          )}
          {siembraRetrasada.length > 0 && faltaGerminacion.length > 0 && (
            <Separator />
          )}

          {faltaGerminacion.length > 0 && (
            <AlertSection
              title="Falta Recuento Germinación"
              description="Partidas que estando en fecha no cuentan con dato de germinación"
              count={faltaGerminacion.length}
              alertType="falta-germinacion"
              columns={faltaGerminacionColumns}
              data={faltaGerminacion}
              exportColumns={faltaGerminacionExportColumns}
            />
          )}
          {faltaGerminacion.length > 0 && faltantePlantas.length > 0 && (
            <Separator />
          )}

          {faltantePlantas.length > 0 && (
            <AlertSection
              title="Faltante Estimado de Plantas"
              description="Partidas donde plantas germinadas son menor a las solicitadas"
              count={faltantePlantas.length}
              alertType="faltante-plantas"
              columns={faltantePlantasColumns}
              data={faltantePlantas}
              exportColumns={faltantePlantasExportColumns}
            />
          )}
          {faltantePlantas.length > 0 && faltaPreExpedicion.length > 0 && (
            <Separator />
          )}

          {faltaPreExpedicion.length > 0 && (
            <AlertSection
              title="Falta Pre-Expedición"
              description="Partidas sin pre-expedición cargada"
              count={faltaPreExpedicion.length}
              alertType="falta-pre-expedicion"
              columns={faltaPreExpedicionColumns}
              data={faltaPreExpedicion}
              exportColumns={faltaPreExpedicionExportColumns}
            />
          )}
        </>
      )}
    </div>
  );
}

export function AlertsDashboardV1() {
  return (
    <Suspense fallback={<AlertDashboardSkeleton />}>
      <AlertsContent />
    </Suspense>
  );
}
