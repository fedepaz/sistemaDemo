// apps/frontend/src/features/extendidos/components/extendidos-view.tsx
"use client";

import { useState, Suspense } from "react";
import { ExtendidoDataTable } from "./extendido-data-table";
import { ExtendidosSelector } from "./extendidos-selector";
import { useExtendidos } from "../hooks/useExtendidosWithFilters";
import { EmptyState } from "./empty-state";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { partidaColumns } from "./columns";

function ExtendidoList({ camaraId }: { camaraId: string }) {
  const { 
    data: extendidos, 
    isFetching, 
    filteredCount, 
    rawCount 
  } = useExtendidos(camaraId);

  const hasData = extendidos && extendidos.length > 0;

  if (!hasData && !isFetching) {
    return (
      <EmptyState
        title="Sin resultados"
        description={
          rawCount > 0 
            ? "No hay registros en la cámara seleccionada."
            : "No hay registros de extendidos en cámara actualmente."
        }
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Mostrando <span className="text-primary">{filteredCount}</span> de {rawCount} registros en cámara
        </p>
      </div>
      <ExtendidoDataTable partidas={extendidos || []} />
      
      {/* Visual indicator for background fetching */}
      {isFetching && (
        <div className="fixed bottom-8 right-8 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-pulse z-50 flex items-center gap-2">
          <div className="h-2 w-2 bg-white rounded-full animate-bounce" />
          Actualizando...
        </div>
      )}
    </>
  );
}

export function ExtendidoView() {
  const [camaraId, setCamaraId] = useState<string>("all");

  return (
    <div className="space-y-6">
      <ExtendidosSelector
        onCamaraChange={setCamaraId}
        onClearFilters={() => setCamaraId("all")}
      />

      <Suspense
        fallback={<DataTableSkeleton columnCount={partidaColumns.length} />}
      >
        <ExtendidoList camaraId={camaraId} />
      </Suspense>
    </div>
  );
}
