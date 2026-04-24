"use client";

import { useState, Suspense } from "react";
import { ExtendidoDataTable } from "./extendido-data-table";
import { ExtendidosSelector } from "./extendidos-selector";
import {
  FilterType,
  useExtendidosWithFilters,
} from "../hooks/useExtendidosWithFilters";
import { EmptyState } from "./empty-state";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { partidaColumns } from "./columns";

function ExtendidoList({
  filters,
}: {
  filters: { type: FilterType; value?: string; camaraId?: string };
}) {
  const { data: extendidos, isFetching, filteredCount, rawCount } = useExtendidosWithFilters(filters);

  const hasData = extendidos && extendidos.length > 0;

  if (!hasData && !isFetching) {
    return (
      <EmptyState
        title="Sin resultados"
        description={
          rawCount > 0 
            ? "No hay registros en la cámara seleccionada para este conjunto de datos."
            : "No se encontraron registros para los filtros seleccionados."
        }
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Mostrando <span className="text-primary">{filteredCount}</span> de {rawCount} registros
        </p>
      </div>
      <ExtendidoDataTable partidas={extendidos || []} />
      
      {/* Visual indicator for background fetching (UX improvement) */}
      {isFetching && (
        <div className="fixed bottom-8 right-8 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-pulse z-50 flex items-center gap-2">
          <div className="h-2 w-2 bg-white rounded-full animate-bounce" />
          Sincronizando...
        </div>
      )}
    </>
  );
}

export function ExtendidoView() {
  const [filters, setFilters] = useState<{
    type: FilterType;
    value?: string;
    camaraId?: string;
  }>({ type: "none", camaraId: "all" });

  return (
    <div className="space-y-6">
      <ExtendidosSelector
        onSourceChange={(source) => 
          setFilters(prev => ({ ...prev, ...source }))
        }
        onCamaraChange={(camaraId) => 
          setFilters(prev => ({ ...prev, camaraId }))
        }
        onClearFilters={() => setFilters({ type: "none", camaraId: "all" })}
      />

      <Suspense
        fallback={<DataTableSkeleton columnCount={partidaColumns.length} />}
      >
        <ExtendidoList filters={filters} />
      </Suspense>
    </div>
  );
}
