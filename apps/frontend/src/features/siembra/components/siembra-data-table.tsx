// src/features/siembra/components/siembra-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { useState, useCallback, useEffect, useMemo } from "react";

import {
  AsignarUbiSiembraDto,
  AsignarUbiSiembraDtoSchema,
  SiembraDto,
} from "@vivero/shared";

import { getLocalDateStr } from "@/lib/date-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { partidaSiembraColumns } from "./columns";
import { SiembraViewForm } from "./siembra-view-form";
import { SiembraEditForm } from "./siembra-edit-form";
import { useSiembraPartidaMutation } from "../hooks/useSiembraPartidaMutation";

interface SiembraDataTableProps {
  partidas: SiembraDto[];
}

export function SiembraDataTable({ partidas }: SiembraDataTableProps) {
  const [slideOverOpen, setSlideOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] = useState<SiembraDto | null>(
    null,
  );
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [filterToday, setFilterToday] = useState(false);

  const { mutateAsync: asignarUbicacionSiembra } =
    useSiembraPartidaMutation();

  const filteredPartidas = useMemo(() => {
    if (!filterToday) return partidas;

    const today = new Date();
    const todayStr = getLocalDateStr(today);

    return partidas.filter((p) => p.fechaEgresoCamara === todayStr);
  }, [partidas, filterToday]);

  const formAsignarUbicacion = useForm<AsignarUbiSiembraDto>({
    resolver: zodResolver(AsignarUbiSiembraDtoSchema),
  });

  useEffect(() => {
    if (selectedPartida) {
      const initialStock = selectedPartida.stockInicial ?? selectedPartida.con;

      formAsignarUbicacion.reset({
        partida: selectedPartida.partidaId,
        ano: selectedPartida.anio,
        indice: selectedPartida.indice,
        ubicacion: selectedPartida.codigoUbicacion ?? undefined,
        stock_ini: initialStock,
        detalle: "",
        baja: Number(selectedPartida.baja) || 0,
        extendido: selectedPartida.extendido || selectedPartida.detalle || "",
        edita: "S",
      });
    }
  }, [selectedPartida, formAsignarUbicacion]);

  const handleAsignarUbicacionSiembra = async (
    formData: AsignarUbiSiembraDto,
  ) => {
    if (selectedPartida) {
      try {
        await asignarUbicacionSiembra(formData);
        setSlideOpen(false);
      } catch {}
    }
  };

  const handleExtendidoView = (row: SiembraDto) => {
    setSelectedPartida(row);
    setMode("view");
    setSlideOpen(true);
  };

  const handleEdit = (row: SiembraDto) => {
    setSelectedPartida(row);
    setMode("edit");
    setSlideOpen(true);
  };

  const handleExport = () => {
    console.log("Exporting...");
  };

  const handleClear = useCallback(() => {
    setFilterToday(false);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setSlideOpen(open);
    if (!open) {
      setSelectedPartida(null);
    }
  };

  const hasActiveFilters = filterToday;

  const toolbarContent = (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto"></div>
  );

  return (
    <>
      <DataTable
        columns={partidaSiembraColumns}
        data={filteredPartidas}
        title="Siembra"
        description="Gestión y monitoreo de bandejas en proceso de siembra"
        tableName="extendidos"
        totalCount={filteredPartidas.length}
        onExport={handleExport}
        onView={handleExtendidoView}
        onEdit={handleEdit}
        toolbarContent={toolbarContent}
        canExecuteLabel="Asignar Ubicación"
      />

      {selectedPartida && (
        <SlideOverForm
          open={slideOverOpen}
          onOpenChange={handleOpenChange}
          title={
            mode === "view"
              ? `Partida #${selectedPartida.partidaId}`
              : `Procesar Extendido #${selectedPartida.partidaId}`
          }
          formId="extendido-form"
          mode={mode}
          form={formAsignarUbicacion}
          saveLabel="Confirmar Extendido"
        >
          <div className="space-y-2">
            {mode === "view" ? (
              <SiembraViewForm selectedExtendido={selectedPartida} />
            ) : (
              <SiembraEditForm
                form={formAsignarUbicacion}
                onSubmit={handleAsignarUbicacionSiembra}
                onCancel={() => setSlideOpen(false)}
                selectedExtendido={selectedPartida}
              />
            )}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
