// src/features/extendidos/components/extendidos-view.tsx
"use client";

import { useState } from "react";
import { PartidasSelector } from "./partidas-selector";
import { ExtendidoDataTable } from "./extendido-data-table";
import {
  FilterType,
  usePartidasWithFilters,
} from "../hooks/usePartidasByfilter";

export function ExtendidoView() {
  const [filters, setFilters] = useState<{
    type: FilterType;
    value?: string | number;
    value2?: string | number;
    camaraId?: string;
  }>({ type: "none" });

  const { data: partidas = [], isFetching } = usePartidasWithFilters(filters);

  return (
    <div className="space-y-6">
      <PartidasSelector
        onPartidaSelected={(id) =>
          setFilters({ type: "partida", value: Number(id) })
        }
        onFechaSelected={(fecha, camaraId) => 
          setFilters({ type: "fecha", value: fecha, camaraId })
        }
        onFechaRangeSelected={(inicio, fin, camaraId) =>
          setFilters({ type: "fechaRange", value: inicio, value2: fin, camaraId })
        }
        onClearFilters={() => setFilters({ type: "none" })}
      />
      
      {/* 
          Note: ExtendidoDataTable is a presentational component 
          that receives the filtered data. 
      */}
      <ExtendidoDataTable partidas={partidas} />
      
      {/* Visual indicator for background fetching (UX improvement) */}
      {isFetching && (
        <div className="fixed bottom-8 right-8 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-pulse z-50">
          Actualizando Datos...
        </div>
      )}
    </div>
  );
}
