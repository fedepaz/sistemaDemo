// src/features/siembra/components/siembra-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { useState, useCallback, useMemo, useEffect } from "react";

import {
  AutorizarSiembraDto,
  AutorizarSiembraSchema,
  SiembraDto,
  fieldLabels,
} from "@vivero/shared";

import { ColumnDef } from "@tanstack/react-table";
import { partidaSiembraExportColumns, getRowBg } from "./columns";
import { SiembraViewForm } from "./siembra-view-form";
import { AutorizarSiembraEditForm } from "./autorizar-siembra-edit-form";
import { useSiembraAutorizacion } from "../hooks/useSiembraPartidaMutation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface SiembraDataTableProps {
  partidas: SiembraDto[];
  columns: ColumnDef<SiembraDto, unknown>[];
  aSembrarKeys: Set<string>;
  registradasKeys: Set<string>;
}

export function SiembraDataTable({
  partidas,
  columns,
  aSembrarKeys,
  registradasKeys,
}: SiembraDataTableProps) {
  const [slideOverOpen, setSlideOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] = useState<SiembraDto | null>(
    null,
  );
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [selectedWeek, setSelectedWeek] = useState("all");

  const { mutateAsync: autorizarSiembra } = useSiembraAutorizacion();

  const formAutorizarSiembra = useForm<AutorizarSiembraDto>({
    resolver: zodResolver(AutorizarSiembraSchema),
  });

  useEffect(() => {
    if (selectedPartida) {
      formAutorizarSiembra.reset({
        partidaId: selectedPartida.partidaId,
        anio: selectedPartida.anio,
        indice: selectedPartida.indice,
      });
    }
  }, [selectedPartida, formAutorizarSiembra]);

  const availableWeeks = useMemo(
    () => [...new Set(partidas.map((p) => p.sem_siembra))].sort().reverse(),
    [partidas],
  );

  const filteredPartidas = useMemo(() => {
    const rows =
      selectedWeek === "all"
        ? partidas
        : partidas.filter((p) => p.sem_siembra === selectedWeek);

    const catOrder = (c: string) =>
      c === "bg-yellow-500/10" ? 0 : c === "bg-green-500/10" ? 1 : 2;

    return [...rows].sort((a, b) => {
      const catA = getRowBg(a, aSembrarKeys, registradasKeys);
      const catB = getRowBg(b, aSembrarKeys, registradasKeys);
      const catDiff = catOrder(catA) - catOrder(catB);
      return catDiff !== 0
        ? catDiff
        : b.fechaSugeridaSiembra.localeCompare(a.fechaSugeridaSiembra);
    });
  }, [partidas, selectedWeek, aSembrarKeys, registradasKeys]);

  const getRowClassName = useCallback(
    (row: SiembraDto) => getRowBg(row, aSembrarKeys, registradasKeys),
    [aSembrarKeys, registradasKeys],
  );

  const isAlreadyAuthorized = useMemo(
    () =>
      selectedPartida
        ? getRowBg(selectedPartida, aSembrarKeys, registradasKeys) !== ""
        : false,
    [selectedPartida, aSembrarKeys, registradasKeys],
  );

  const handleView = useCallback((row: SiembraDto) => {
    setSelectedPartida(row);
    setMode("view");
    setSlideOpen(true);
  }, []);

  const handleAutorizar = useCallback(
    async (data: AutorizarSiembraDto) => {
      try {
        await autorizarSiembra({
          partidaId: data.partidaId,
          anio: data.anio,
          indice: data.indice,
        });
        setSlideOpen(false);
      } catch {}
    },
    [autorizarSiembra],
  );

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
        columns={columns}
        data={filteredPartidas}
        title="Siembra"
        description="Gestión y monitoreo de bandejas en proceso de siembra"
        tableName="siembra"
        totalCount={filteredPartidas.length}
        exportColumns={partidaSiembraExportColumns}
        onView={handleView}
        onEdit={(row) => {
          setSelectedPartida(row);
          setMode("edit");
          setSlideOpen(true);
        }}
        canExecuteLabel="Autorizar Siembra"
        columnLabels={fieldLabels.SiembraLegacy}
        toolbarContent={toolbarContent}
        getRowClassName={getRowClassName}
      />

      {selectedPartida && (
        <SlideOverForm
          open={slideOverOpen}
          onOpenChange={handleOpenChange}
          title={`Partida Nº ${selectedPartida.partidaId}`}
          formId="autorizar-siembra-form"
          mode={mode}
          form={formAutorizarSiembra}
          saveLabel="Autorizar Siembra"
          fieldLabels={fieldLabels.SiembraPartida}
          confirm={{
            title: "Autorizar siembra",
            description: "¿Deseas autorizar esta partida para siembra?",
            label: "Autorizar Siembra",
            summaryFields: ["partidaId", "anio", "indice"],
          }}
        >
          <div className="space-y-2">
            {mode === "view" ? (
              <SiembraViewForm selectedExtendido={selectedPartida} />
            ) : (
              <AutorizarSiembraEditForm
                form={formAutorizarSiembra}
                onSubmit={handleAutorizar}
                onCancel={() => setSlideOpen(false)}
                selectedSiembra={selectedPartida}
                isAlreadyAuthorized={isAlreadyAuthorized}
              />
            )}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
