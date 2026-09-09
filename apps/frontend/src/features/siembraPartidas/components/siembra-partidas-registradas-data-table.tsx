"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { useState, useCallback } from "react";
import { SiembraPartidaDto, fieldLabels } from "@vivero/shared";
import {
  siembraPartidasRegistradasColumns,
  siembraPartidasRegistradasExportColumns,
} from "./columns";
import { SiembraPartidasRegistradasViewForm } from "./siembra-partidas-registradas-view-form";

interface SiembraPartidasRegistradasDataTableProps {
  partidas: SiembraPartidaDto[];
}

export function SiembraPartidasRegistradasDataTable({
  partidas,
}: SiembraPartidasRegistradasDataTableProps) {
  const [slideOverOpen, setSlideOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] =
    useState<SiembraPartidaDto | null>(null);

  const handleView = useCallback((row: SiembraPartidaDto) => {
    setSelectedPartida(row);
    setSlideOpen(true);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setSlideOpen(open);
    if (!open) {
      setSelectedPartida(null);
    }
  }, []);

  return (
    <>
      <DataTable
        columns={siembraPartidasRegistradasColumns}
        data={partidas}
        title="Partidas Registradas"
        description="Partidas con datos de siembra registrados en el sistema"
        tableName="siembra"
        totalCount={partidas.length}
        onView={handleView}
        exportColumns={siembraPartidasRegistradasExportColumns}
        columnLabels={fieldLabels.SiembraPartida}
      />

      {selectedPartida && (
        <SlideOverForm
          open={slideOverOpen}
          onOpenChange={handleOpenChange}
          title={`Partida Nº ${selectedPartida.partidaId}`}
          formId="siembra-partidas-registradas-form"
          mode="view"
          fieldLabels={fieldLabels.SiembraPartida}
        >
          <SiembraPartidasRegistradasViewForm
            selectedPartida={selectedPartida}
          />
        </SlideOverForm>
      )}
    </>
  );
}
