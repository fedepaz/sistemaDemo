// src/features/extendidos/components/extendido-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { useState, useCallback } from "react";
import { ExtendidosViewForm } from "./extendido-view-form";
import { partidaColumns } from "./columns";
import {
  AsignarUbicacionDto,
  AsignarUbicacionDtoSchema,
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
import { Building2, RotateCcw } from "lucide-react";
import { ExtendidosEditForm } from "./extendido-edit-form";
import { usePartidaMutation } from "../hooks/usePartidaMutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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

  const handleProcessSuccess = () => {
    setSlideOpen(false);
    setSelectedPartida(null);
  };

  const { mutateAsync: asignarUbicacion, isPending: isAsignandoUbicacion } =
    usePartidaMutation();

  const formAsignarUbicacion = useForm<AsignarUbicacionDto>({
    resolver: zodResolver(AsignarUbicacionDtoSchema),
  });

  const handleAsignarUbicacion = async (formData: AsignarUbicacionDto) => {
    try {
      await asignarUbicacion(formData);
    } catch {}

    if (!isAsignandoUbicacion) setSlideOpen(false);
  };

  const handleExtendidoView = (row: ExtendidoDto) => {
    setSelectedPartida(row);
    setMode("view");
    setSlideOpen(true);
  };

  const handleEdit = (row: ExtendidoDto) => {
    setSelectedPartida(row);
    setMode("edit");
    setSlideOpen(true);
  };

  const handleExport = () => {
    console.log("Exporting...");
  };

  const handleCamaraChange = (value: string) => {
    onCamaraChange?.(value);
  };

  const handleClear = useCallback(() => {
    onCamaraChange?.("all");
  }, [onCamaraChange]);

  const handleOpenChange = (open: boolean) => {
    setSlideOpen(open);
    if (!open) {
      setSelectedPartida(null);
    }
  };

  const hasActiveFilters = currentCamaraId !== "all";

  const toolbarContent = (
    <div className="flex items-center gap-2 flex-1 max-w-sm ml-auto">
      <div className="relative flex-1 group">
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
        <Select value={currentCamaraId} onValueChange={handleCamaraChange}>
          <SelectTrigger className="h-9 pl-9 rounded-full bg-background border-border/40 focus:ring-primary/20 text-xs font-bold uppercase tracking-tight">
            <SelectValue placeholder="Filtrar por Cámara" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60 shadow-2xl">
            <SelectItem value="all" className="font-bold text-primary italic">
              Todas las cámaras
            </SelectItem>
            {camaras.map((c) => (
              <SelectItem
                key={c.codigo}
                value={c.codigo.toString()}
                className="font-medium"
              >
                {c.nombre}
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
          <TooltipContent side="top">Limpiar filtro de cámara</TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  return (
    <>
      <DataTable
        columns={partidaColumns}
        data={partidas}
        title="Partidas a Extender"
        description="Gestión y monitoreo de bandejas en proceso de extendido"
        tableName="extendidos"
        totalCount={partidas.length}
        onExport={handleExport}
        onView={handleExtendidoView}
        onEdit={handleEdit}
        toolbarContent={toolbarContent}
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
          saveLabel="Confirmar Extendido"
        >
          <div className="space-y-2">
            {mode === "view" ? (
              <ExtendidosViewForm selectedExtendido={selectedPartida} />
            ) : (
              <ExtendidosEditForm
                form={formAsignarUbicacion}
                onSubmit={handleAsignarUbicacion}
                onCancel={() => setSlideOpen(false)}
              />
            )}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
