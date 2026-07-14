// src/features/alerts/components/v1/AlertsDashboardV1.tsx
"use client";

import { Suspense } from "react";
import { AlertTriangle } from "lucide-react";
import { AlertSummaryCards } from "../shared/alert-summary-cards";
import { AlertsDataTable } from "./alerts-data-table";
import {
  siembraRetrasadaColumns,
  faltaGerminacionColumns,
  faltantePlantasColumns,
  faltaPreExpedicionColumns,
} from "../shared/alert-columns";
import {
  useSiembraRetrasada,
  useFaltaGerminacion,
  useFaltantePlantas,
  useFaltaPreExpedicion,
} from "../../hooks/useAlerts";
import { AlertDashboardSkeleton } from "../shared/alert-dashboard-skeleton";

function AlertSection({
  title,
  description,
  count,
  columns,
  data,
}: {
  title: string;
  description: string;
  count: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
          {title}
        </h2>
        <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <AlertsDataTable
        title={title}
        description={description}
        columns={columns}
        data={data}
      />
    </div>
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
              columns={siembraRetrasadaColumns}
              data={siembraRetrasada}
            />
          )}

          {faltaGerminacion.length > 0 && (
            <AlertSection
              title="Falta Recuento Germinación"
              description="Partidas que estando en fecha no cuentan con dato de germinación"
              count={faltaGerminacion.length}
              columns={faltaGerminacionColumns}
              data={faltaGerminacion}
            />
          )}

          {faltantePlantas.length > 0 && (
            <AlertSection
              title="Faltante Estimado de Plantas"
              description="Partidas donde plantas germinadas son menor a las solicitadas"
              count={faltantePlantas.length}
              columns={faltantePlantasColumns}
              data={faltantePlantas}
            />
          )}

          {faltaPreExpedicion.length > 0 && (
            <AlertSection
              title="Falta Pre-Expedición"
              description="Partidas sin pre-expedición cargada"
              count={faltaPreExpedicion.length}
              columns={faltaPreExpedicionColumns}
              data={faltaPreExpedicion}
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
