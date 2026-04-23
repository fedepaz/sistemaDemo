// src/features/extendidos/components/extendidos-view.tsx
"use client";

import { useState, Suspense } from "react";
import { ExtendidoDataTable } from "./extendido-data-table";
import { ExtendidosSelector } from "./extendidos-selector";
import {
  useExtendidosByFecha,
  useExtendidosEnCamaraByFecha,
} from "../hooks/useExtendidos";
import { EmptyState } from "./empty-state";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { partidaColumns } from "./columns";

function ExtendidoList({ selectedDate }: { selectedDate: string | null }) {
  // Use useAllExtendidos if no date is selected, otherwise use useExtendidosByFecha
  const today = new Date(2025, 6, 3);
  const year = today.getFullYear();
  const month =
    today.getMonth() > 9 ? today.getMonth() + 1 : `0${today.getMonth() + 1}`;
  const day = today.getDate() > 9 ? today.getDate() : `0${today.getDate()}`;
  const allExtendidosQuery = useExtendidosEnCamaraByFecha(
    `${year}-${month}-${day}`,
  );
  const byFechaQuery = useExtendidosByFecha(selectedDate || "");

  // Determine which query to use based on selectedDate
  const query = selectedDate ? byFechaQuery : allExtendidosQuery;
  const extendidos = query.data;
  const isFetching = query.isFetching;

  const hasData = extendidos && extendidos.length > 0;

  if (!hasData && !isFetching) {
    return (
      <EmptyState
        title={selectedDate ? "Sin resultados" : "No hay datos"}
        description={
          selectedDate
            ? `No se encontraron extendidos para la fecha ${selectedDate}.`
            : "No hay registros de extendidos disponibles."
        }
      />
    );
  }

  return (
    <>
      <ExtendidoDataTable partidas={extendidos || []} />
      {isFetching && (
        <div className="fixed bottom-8 right-8 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-pulse z-50">
          Sincronizando...
        </div>
      )}
    </>
  );
}

export function ExtendidoView() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <ExtendidosSelector
        onFechaSelected={(fecha) => setSelectedDate(fecha)}
        onClearFilters={() => setSelectedDate(null)}
      />

      <Suspense
        fallback={<DataTableSkeleton columnCount={partidaColumns.length} />}
      >
        <ExtendidoList selectedDate={selectedDate} />
      </Suspense>
    </div>
  );
}
