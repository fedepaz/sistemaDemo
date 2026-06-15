// src/features/extendidos/components/extendido-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { useState, useCallback, useEffect, useMemo } from "react";

import {
  AsignarUbicacionDto,
  AsignarUbicacionDtoSchema,
  SiembraDto,
} from "@vivero/shared";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { RotateCcw, CalendarDays } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getLocalDateStr } from "@/lib/date-utils";
import { partidaSiembraColumns } from "./columns";
import { SiembraViewForm } from "./siembra-view-form";
import { SiembraEditForm } from "./siembra-edit-form";

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

  const filteredPartidas = useMemo(() => {
    if (!filterToday) return partidas;

    const today = new Date();
    const todayStr = getLocalDateStr(today);

    return partidas.filter((p) => p.fechaEgresoCamara === todayStr);
  }, [partidas, filterToday]);

  const formAsignarUbicacion = useForm<AsignarUbicacionDto>({
    resolver: zodResolver(AsignarUbicacionDtoSchema),
  });

  useEffect(() => {
    if (selectedPartida) {
      // Use 'con' (Bandejas en Cámara) as the default source for stock_ini
      // if stockInicial isn't defined yet
      const initialStock = selectedPartida.stockInicial ?? selectedPartida.con;

      formAsignarUbicacion.reset({
        partida: selectedPartida.partidaId,
        ano: selectedPartida.anio,
        indice: selectedPartida.indice,
        ubicacion: selectedPartida.codigoUbicacion ?? undefined,
        stock_ini: initialStock,
        detalle: "", // Reset detalle (limit 30)
        baja: Number(selectedPartida.baja) || 0,
        extendido: selectedPartida.extendido || selectedPartida.detalle || "",
        edita: "S",
      });
    }
  }, [selectedPartida, formAsignarUbicacion]);

  const handleAsignarUbicacion = async (formData: AsignarUbicacionDto) => {
    if (selectedPartida) {
      try {
        //await asignarUbicacion(formData);
        console.log("asignar ubicacion", formData);
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
          //isLoading={isAsignandoUbicacion}
          saveLabel="Confirmar Extendido"
        >
          <div className="space-y-2">
            {mode === "view" ? (
              <SiembraViewForm selectedExtendido={selectedPartida} />
            ) : (
              <SiembraEditForm
                form={formAsignarUbicacion}
                onSubmit={handleAsignarUbicacion}
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
