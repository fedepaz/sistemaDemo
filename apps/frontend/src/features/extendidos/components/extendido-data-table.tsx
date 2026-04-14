// src/features/extendidos/components/extendido-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";

import { useState } from "react";
import { ExtendidosForm } from "./extendido-form";
import { usePartidas } from "../hooks/usePartidas";
import { partidaColumns } from "./columns";
import { PartidaDto } from "@vivero/shared";

export function ExtendidoDataTable() {
  const { data: partidas } = usePartidas();

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] = useState<PartidaDto>();

  const handleExtendidoView = (row: PartidaDto) => {
    setSelectedPartida(row);
    setSlideOverOpen(true);
  };
  const handleExport = () => {
    console.log("Exporting...");
  };

  return (
    <>
      <DataTable
        columns={partidaColumns}
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
          title={`Detalle de Partida: ${selectedPartida.partida}`}
          description={`Detalles completos para la partida ${selectedPartida.partida} del año ${selectedPartida.ano}`}
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
