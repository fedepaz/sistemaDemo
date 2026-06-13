// apps/frontend/src/features/siembra/components/siembra-view.tsx
"use client";

import { useState, Suspense } from "react";

import { EmptyState } from "./empty-state";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { partidaSiembraColumns } from "./columns";
import { useExtendidos } from "@/features/extendidos/hooks/useExtendidosWithFilters";
import { SiembraDataTable } from "./siembra-data-table";

function SiembraList({
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
    <>
      <SiembraDataTable
        partidas={extendidos || []}
        onCamaraChange={onCamaraChange}
        currentCamaraId={camaraId}
      />

      {/* Visual indicator for background fetching */}
      {isFetching && (
        <DataTableSkeleton columnCount={partidaSiembraColumns.length} />
      )}
    </>
  );
}

export function SiembraView() {
  const [camaraId, setCamaraId] = useState<string>("all");

  return (
    <div className="space-y-4">
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={partidaSiembraColumns.length} />
        }
      >
        <SiembraList camaraId={camaraId} onCamaraChange={setCamaraId} />
      </Suspense>
    </div>
  );
}
