// src/features/siembra/components/siembra-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { useState, useEffect, useCallback, useMemo } from "react";

import {
  AsignarUbiSiembraCompletaDto,
  AsignarUbiSiembraCompletaDtoSchema,
  SiembraDto,
  fieldLabels,
} from "@vivero/shared";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { partidaSiembraColumns, partidaSiembraExportColumns } from "./columns";
import { SiembraViewForm } from "./siembra-view-form";
import { SiembraEditForm } from "./siembra-edit-form";
import { useSiembraMutation } from "../hooks/useSiembraPartidaMutation";
import { useTableByName } from "@/features/permissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

interface SiembraDataTableProps {
  partidas: SiembraDto[];
}

export function SiembraDataTable({ partidas }: SiembraDataTableProps) {
  const [slideOverOpen, setSlideOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] = useState<SiembraDto | null>(
    null,
  );
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [selectedWeek, setSelectedWeek] = useState("all");

  const { mutateAsync: asignarUbicacionSiembra } = useSiembraMutation();
  const { data: entity } = useTableByName("siembra");

  const availableWeeks = useMemo(
    () => [...new Set(partidas.map((p) => p.sem_siembra))].sort().reverse(),
    [partidas],
  );

  const filteredPartidas = useMemo(
    () =>
      selectedWeek === "all"
        ? partidas
        : partidas.filter((p) => p.sem_siembra === selectedWeek),
    [partidas, selectedWeek],
  );

  const formAsignarUbicacion = useForm<AsignarUbiSiembraCompletaDto>({
    resolver: zodResolver(AsignarUbiSiembraCompletaDtoSchema),
  });

  useEffect(() => {
    if (selectedPartida) {
      formAsignarUbicacion.reset({
        partidaId: selectedPartida.partidaId,
        anio: selectedPartida.anio,
        indice: selectedPartida.indice,
        cantidaNroCont: parseInt(selectedPartida.nrocont),
        detalleExtendido: "",
        f_siembra: new Date(),
        edita: "S",
        lote: parseInt(selectedPartida.lote),
        anoLote: parseInt(selectedPartida.anoLote),
        item: selectedPartida.item,
        semxgr: parseFloat(selectedPartida.semxgr),
        ajuste: "",
        cantidadGrs: 0,
        presionSemilla: 0,
        profundidadSemilla: "",
        metodoMaquina: true,
        tratamientoSemilla: "",
        entityId: entity.id,
      });
    }
  }, [selectedPartida, formAsignarUbicacion, entity]);

  const handleAsignarUbicacionSiembra = async (
    formData: AsignarUbiSiembraCompletaDto,
  ) => {
    if (selectedPartida) {
      try {
        await asignarUbicacionSiembra(formData);
        setSlideOpen(false);
      } catch {}
    }
  };

  const handleView = useCallback((row: SiembraDto) => {
    setSelectedPartida(row);
    setMode("view");
    setSlideOpen(true);
  }, []);

  const handleEdit = useCallback((row: SiembraDto) => {
    setSelectedPartida(row);
    setMode("edit");
    setSlideOpen(true);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setSlideOpen(open);
    if (!open) {
      setSelectedPartida(null);
    }
  }, []);

  const toolbarContent = (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
      <CalendarDays className="h-3 w-3 text-muted-foreground" />
      <Select value={selectedWeek} onValueChange={setSelectedWeek}>
        <SelectTrigger className="h-8 w-[140px] rounded-full bg-background border-border/40 focus:ring-primary/20 text-[10px] font-bold uppercase tracking-tight">
          <SelectValue placeholder="Semana" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-border/60 shadow-2xl">
          <SelectItem value="all" className="font-bold text-primary italic">
            Todas
          </SelectItem>
          {availableWeeks.map((week) => (
            <SelectItem key={week} value={week} className="font-medium">
              {week}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      <DataTable
        columns={partidaSiembraColumns}
        data={filteredPartidas}
        title="Siembra"
        description="Gestión y monitoreo de bandejas en proceso de siembra"
        tableName="siembra"
        totalCount={filteredPartidas.length}
        exportColumns={partidaSiembraExportColumns}
        onView={handleView}
        onEdit={handleEdit}
        canExecuteLabel="Asignar Ubicación"
        columnLabels={fieldLabels.SiembraLegacy}
        toolbarContent={toolbarContent}
      />

      {selectedPartida && (
        <SlideOverForm
          open={slideOverOpen}
          onOpenChange={handleOpenChange}
          title={`Partida Nº ${selectedPartida.partidaId}`}
          formId="siembra-form"
          mode={mode}
          form={formAsignarUbicacion}
          saveLabel="Confirmar Ubicación"
          fieldLabels={fieldLabels.AsignarUbiSiembraCompleta}
          confirm={{
            title: "Confirmar ubicación",
            description:
              "¿Deseas confirmar la asignación de esta ubicación de siembra?",
            label: "Confirmar Ubicación",
          }}
        >
          <div className="space-y-2">
            {mode === "view" ? (
              <SiembraViewForm selectedExtendido={selectedPartida} />
            ) : (
              <SiembraEditForm
                form={formAsignarUbicacion}
                onSubmit={handleAsignarUbicacionSiembra}
                onCancel={() => setSlideOpen(false)}
                selectedSiembra={selectedPartida}
              />
            )}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
