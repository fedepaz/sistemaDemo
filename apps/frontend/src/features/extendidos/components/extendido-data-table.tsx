// src/features/extendidos/components/extendido-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { useState, useCallback, useEffect, useMemo } from "react";
import { ExtendidosViewForm } from "./extendido-view-form";
import { partidaColumns, partidaExportColumns } from "./columns";
import {
  AsignarUbiExtendidoDto,
  AsignarUbiExtendidoDtoSchema,
  ExtendidoDto,
} from "@vivero/shared";
import { useCamaras } from "../hooks/useDepositos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Building2, RotateCcw, CalendarDays } from "lucide-react";
import { ExtendidosEditForm } from "./extendido-edit-form";
import { usePartidaMutation } from "../hooks/usePartidaMutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getLocalDateStr } from "@/lib/date-utils";

interface ExtendidoDataTableProps {
  partidas: ExtendidoDto[];
  onCamaraChange?: (camaraId: string) => void;
  currentCamaraId?: string;
}

export function ExtendidoDataTable({
  partidas,
  onCamaraChange,
  currentCamaraId = "all",
}: ExtendidoDataTableProps) {
  const { data: camaras = [] } = useCamaras();
  const [slideOverOpen, setSlideOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] = useState<ExtendidoDto | null>(
    null,
  );
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [filterToday, setFilterToday] = useState(false);

  const { mutateAsync: asignarUbicacion, isPending: isAsignandoUbicacion } =
    usePartidaMutation();

  const filteredPartidas = useMemo(() => {
    if (!filterToday) return partidas;

    const today = new Date();
    const todayStr = getLocalDateStr(today);

    return partidas.filter((p) => p.fechaEgresoCamara === todayStr);
  }, [partidas, filterToday]);

  const formAsignarUbicacion = useForm<AsignarUbiExtendidoDto>({
    resolver: zodResolver(AsignarUbiExtendidoDtoSchema),
  });

  useEffect(() => {
    if (selectedPartida) {
      formAsignarUbicacion.reset({
        partidaId: selectedPartida.partidaId,
        anio: selectedPartida.anio,
        indice: selectedPartida.indice,
        ubicacion: selectedPartida.codigoUbicacion ?? undefined,
        stock_ini: parseInt(selectedPartida.nrocont),
        detalle: "", // Reset detalle (limit 30)
        baja: 0,
        extendido: selectedPartida.extendido || selectedPartida.detalle || "",
        edita: "S",
      });
    }
  }, [selectedPartida, formAsignarUbicacion]);

  const handleAsignarUbicacion = async (formData: AsignarUbiExtendidoDto) => {
    if (selectedPartida) {
      try {
        await asignarUbicacion(formData);
        setSlideOpen(false);
      } catch {}
    }
  };

  const handleExtendidoView = useCallback((row: ExtendidoDto) => {
    setSelectedPartida(row);
    setMode("view");
    setSlideOpen(true);
  }, []);

  const handleEdit = useCallback((row: ExtendidoDto) => {
    setSelectedPartida(row);
    setMode("edit");
    setSlideOpen(true);
  }, []);

  const handleCamaraChange = useCallback(
    (value: string) => {
      onCamaraChange?.(value);
    },
    [onCamaraChange],
  );

  const handleClear = useCallback(() => {
    onCamaraChange?.("all");
    setFilterToday(false);
  }, [onCamaraChange]);

  const handleOpenChange = useCallback((open: boolean) => {
    setSlideOpen(open);
    if (!open) {
      setSelectedPartida(null);
    }
  }, []);

  const hasActiveFilters = currentCamaraId !== "all" || filterToday;

  const toolbarContent = (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
      <Button
        variant={filterToday ? "default" : "outline"}
        size="sm"
        onClick={() => setFilterToday(!filterToday)}
        className={`h-8 rounded-full px-3 text-[10px] font-black uppercase tracking-tight gap-1.5 transition-all flex-1 sm:flex-none ${
          filterToday
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-primary"
            : "hover:bg-accent hover:text-accent-foreground border-border/40"
        }`}
      >
        <CalendarDays
          className={`h-3 w-3 ${filterToday ? "animate-pulse" : ""}`}
        />
        Hoy
      </Button>

      <div className="relative flex-1 sm:min-w-[160px] group">
        <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
        <Select value={currentCamaraId} onValueChange={handleCamaraChange}>
          <SelectTrigger className="h-8 pl-8 rounded-full bg-background border-border/40 focus:ring-primary/20 text-[10px] font-bold uppercase tracking-tight">
            <SelectValue placeholder="Cámara" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60 shadow-2xl">
            <SelectItem value="all" className="font-bold text-primary italic">
              Nº Cámara
            </SelectItem>
            {camaras.map((c) => (
              <SelectItem
                key={c.codigo}
                value={c.codigo.toString()}
                className="font-medium"
              >
                Nº {c.codigo} - {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8 rounded-full bg-destructive/5 text-destructive hover:bg-destructive/10 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Limpiar filtros</TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  return (
    <>
      <DataTable
        columns={partidaColumns}
        data={filteredPartidas}
        title="Partidas a Extender"
        description="Gestión y monitoreo de bandejas en proceso de extendido"
        tableName="extendidos"
        totalCount={filteredPartidas.length}
        onView={handleExtendidoView}
        onEdit={handleEdit}
        toolbarContent={toolbarContent}
        canExecuteLabel="Asignar Ubicación"
        exportColumns={partidaExportColumns}
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
          isLoading={isAsignandoUbicacion}
          saveLabel="Confirmar Extendido"
          confirm={{
            title: "Confirmar extendido",
            description: "¿Deseas confirmar la asignación de ubicación para este extendido?",
            label: "Confirmar Extendido",
          }}
        >
          <div className="space-y-2">
            {mode === "view" ? (
              <ExtendidosViewForm selectedExtendido={selectedPartida} />
            ) : (
              <ExtendidosEditForm
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
