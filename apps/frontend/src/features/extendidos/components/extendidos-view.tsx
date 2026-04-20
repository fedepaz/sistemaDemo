// src/features/extendidos/components/extendidos-view.tsx
"use client";

import { useState } from "react";
import { ExtendidoDataTable } from "./extendido-data-table";
import { ExtendidosSelector } from "./extendidos-selector";
import { useExtendidosByFecha } from "../hooks/useExtendidos";
import { EmptyState } from "./empty-state";

export function ExtendidoView() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // We only fetch if a date is selected. 
  // Note: if selectedDate is null, the hook will be called but we handle it.
  // In a real scenario, we might want useQuery with "enabled: !!selectedDate" 
  // but since we are using useSuspenseQuery, we should handle the empty state or provide a default.
  
  // For now, let's keep it simple: if no date, we show the selector and an empty state message.
  const { data: extendidos, isFetching } = useExtendidosByFecha(selectedDate || "1900-01-01");

  const hasData = extendidos && extendidos.length > 0;

  return (
    <div className="space-y-6">
      <ExtendidosSelector
        onFechaSelected={(fecha) => setSelectedDate(fecha)}
        onClearFilters={() => setSelectedDate(null)}
      />
      
      {!selectedDate ? (
        <EmptyState 
          title="Seleccione una fecha" 
          description="Utilice el selector superior para consultar los extendidos de una fecha específica."
        />
      ) : !hasData && !isFetching ? (
        <EmptyState 
          title="Sin resultados" 
          description={`No se encontraron extendidos para la fecha ${selectedDate}.`}
        />
      ) : (
        <ExtendidoDataTable partidas={extendidos || []} />
      )}

      {/* Visual indicator for background fetching (UX improvement) */}
      {isFetching && (
        <div className="fixed bottom-8 right-8 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-pulse z-50">
          Sincronizando...
        </div>
      )}
    </div>
  );
}
