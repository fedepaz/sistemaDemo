// apps/frontend/src/features/siembra/components/siembra-view.tsx
"use client";

import { Suspense } from "react";

import { EmptyState } from "./empty-state";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { partidaSiembraColumns } from "./columns";

import { SiembraDataTable } from "./siembra-data-table";
import { useSiembraPartidas } from "../hooks/useSiembraPartidas";

function SiembraList({ camaraId }: { camaraId: string }) {
  const { data: siembraPartidas, isFetching } = useSiembraPartidas();

  const hasData = siembraPartidas && siembraPartidas.length > 0;

  if (!hasData && !isFetching && camaraId === "all") {
    return (
      <EmptyState
        title="Sin registros"
        description="No hay registros de extendidos en cámara actualmente."
      />
    );
  }

  return <SiembraDataTable partidas={siembraPartidas || []} />;
}

export function SiembraView() {
  return (
    <div className="space-y-2">
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={partidaSiembraColumns.length} />
        }
      >
        <SiembraList camaraId="all" />
      </Suspense>
    </div>
  );
}
