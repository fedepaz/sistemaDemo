// src/features/extendido/components/extendido-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";

import { useState } from "react";
import { ExtendidosForm } from "./extendido-form";
import { usePartidas } from "../hooks/usePartidas";
import { PartidaExample } from "../types";
import { partidaExampleColumns } from "./columns";

export function ExtendidoDataTable() {
  const { data: partidas } = usePartidas();

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] = useState<PartidaExample>();

  const handleExtendidoView = (row: PartidaExample) => {
    setSelectedPartida(row);
    setSlideOverOpen(true);
  };
  const handleExport = () => {
    console.log("Export extendidos");
  };

  return (
    <>
      <DataTable
        columns={partidaExampleColumns}
        data={partidas}
        title="Extendido"
        description="Información de extendidos"
        tableName="extendidos"
        totalCount={partidas.length}
        onEdit={() => {}}
        onExport={handleExport}
        onView={handleExtendidoView}
      />
      {selectedPartida && (
        <SlideOverForm
          open={slideOverOpen}
          onOpenChange={setSlideOverOpen}
          title="Ver entidad"
          description="Ver detalles de la entidad"
          formId="extendido-form"
          mode="view"
        >
          <div className="space-y-2">
            <ExtendidosForm selectedExtendido={selectedPartida} />
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
