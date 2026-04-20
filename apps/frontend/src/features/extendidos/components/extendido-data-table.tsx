// src/features/extendidos/components/extendido-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { useState } from "react";
import { ExtendidosForm } from "./extendido-form";
import { partidaColumns } from "./columns";
import { ExtendidoDto } from "@vivero/shared";

interface ExtendidoDataTableProps {
  partidas: ExtendidoDto[];
}

export function ExtendidoDataTable({ partidas }: ExtendidoDataTableProps) {
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] = useState<ExtendidoDto | null>(
    null,
  );

  const handleExtendidoView = (row: ExtendidoDto) => {
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
        title="Partidas Extendidas"
        description="Gestión y monitoreo de bandejas en proceso de extendido"
        tableName="extendidos"
        totalCount={partidas.length}
        onExport={handleExport}
        onView={handleExtendidoView}
      />

      {selectedPartida && (
        <SlideOverForm
          open={slideOverOpen}
          onOpenChange={setSlideOverOpen}
          title={`Partida #${selectedPartida.id}`}
          description={`Detalles técnicos del producto: ${selectedPartida.productName}`}
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
