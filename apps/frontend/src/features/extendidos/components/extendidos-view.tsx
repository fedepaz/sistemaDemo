// apps/frontend/src/features/extendidos/components/extendidos-view.tsx
"use client";

import { useState, Suspense } from "react";
import { ExtendidoDataTable } from "./extendido-data-table";
import { useExtendidos } from "../hooks/useExtendidosWithFilters";
import { EmptyState } from "./empty-state";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { partidaColumns } from "./columns";

function ExtendidoList({
  camaraId,
  onCamaraChange,
}: {
  camaraId: string;
  onCamaraChange: (id: string) => void;
}) {
  const { data: extendidos, isFetching } = useExtendidos(camaraId);

  const hasData = extendidos && extendidos.length > 0;

  if (!hasData && !isFetching && camaraId === "all") {
    return (
      <EmptyState
        title="Sin registros"
        description="No hay registros de extendidos en cámara actualmente."
      />
    );
  }

  return (
    <ExtendidoDataTable
      partidas={extendidos || []}
      onCamaraChange={onCamaraChange}
      currentCamaraId={camaraId}
    />
  );
}

export function ExtendidoView() {
  const [camaraId, setCamaraId] = useState<string>("all");

  return (
    <div className="space-y-4">
      <Suspense
        fallback={<DataTableSkeleton columnCount={partidaColumns.length} />}
      >
        <ExtendidoList camaraId={camaraId} onCamaraChange={setCamaraId} />
      </Suspense>
    </div>
  );
}
