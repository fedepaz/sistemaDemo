// src/features/siembra/components/siembra-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { useState, useEffect, useCallback } from "react";

import {
  AsignarUbiSiembraDto,
  AsignarUbiSiembraDtoSchema,
  SiembraDto,
} from "@vivero/shared";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { partidaSiembraColumns, partidaSiembraExportColumns } from "./columns";
import { SiembraViewForm } from "./siembra-view-form";
import { SiembraEditForm } from "./siembra-edit-form";
import { useSiembraMutation } from "../hooks/useSiembraPartidaMutation";

interface SiembraDataTableProps {
  partidas: SiembraDto[];
}

export function SiembraDataTable({ partidas }: SiembraDataTableProps) {
  const [slideOverOpen, setSlideOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] = useState<SiembraDto | null>(
    null,
  );
  const [mode, setMode] = useState<"view" | "edit">("view");

  const { mutateAsync: asignarUbicacionSiembra } = useSiembraMutation();

  const formAsignarUbicacion = useForm<AsignarUbiSiembraDto>({
    resolver: zodResolver(AsignarUbiSiembraDtoSchema),
  });

  useEffect(() => {
    if (selectedPartida) {
      formAsignarUbicacion.reset({
        partida: selectedPartida.partidaId,
        ano: selectedPartida.anio,
        indice: selectedPartida.indice,
        cantidaNroCont: parseInt(selectedPartida.nrocont),
        detalle: selectedPartida.extendido,
        f_siembra: new Date(),
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

  return (
    <>
      <DataTable
        columns={partidaSiembraColumns}
        data={partidas}
        title="Siembra"
        description="Gestión y monitoreo de bandejas en proceso de siembra"
        tableName="siembra"
        totalCount={partidas.length}
        exportColumns={partidaSiembraExportColumns}
        onView={handleView}
        onEdit={handleEdit}
        canExecuteLabel="Asignar Ubicación"
      />

      {selectedPartida && (
        <SlideOverForm
          open={slideOverOpen}
          onOpenChange={handleOpenChange}
          title={
            mode === "view"
              ? `Partida #${selectedPartida.partidaId}`
              : `Asignar Ubicación #${selectedPartida.partidaId}`
          }
          formId="siembra-form"
          mode={mode}
          form={formAsignarUbicacion}
          saveLabel="Confirmar Ubicación"
          confirm={{
            title: "Confirmar ubicación",
            description: "¿Deseas confirmar la asignación de esta ubicación de siembra?",
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
