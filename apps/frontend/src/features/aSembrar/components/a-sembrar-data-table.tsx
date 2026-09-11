"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { useState, useCallback, useMemo } from "react";
import {
  AsignarUbiSiembraCompletaDto,
  AsignarUbiSiembraCompletaDtoSchema,
  SiembraPartidaDto,
  fieldLabels,
} from "@vivero/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { aSembrarColumns, aSembrarExportColumns } from "./columns";
import { ASembrarEditForm } from "./a-sembrar-edit-form";
import { useASembrarMutation } from "../hooks/useASembrarMutation";
import { useTableByName } from "@/features/permissions";

interface ASembrarDataTableProps {
  partidas: SiembraPartidaDto[];
}

export function ASembrarDataTable({ partidas }: ASembrarDataTableProps) {
  const [slideOverOpen, setSlideOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] =
    useState<SiembraPartidaDto | null>(null);

  const sortedPartidas = useMemo(
    () =>
      [...partidas].sort((a, b) =>
        (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
      ),
    [partidas],
  );

  const { mutateAsync: completarSiembra } = useASembrarMutation();
  const { data: entity } = useTableByName("a_sembrar");

  const formCompletar = useForm<AsignarUbiSiembraCompletaDto>({
    resolver: zodResolver(AsignarUbiSiembraCompletaDtoSchema),
  });

  const handleEdit = useCallback(
    (row: SiembraPartidaDto) => {
      setSelectedPartida(row);
      formCompletar.reset({
        partidaId: row.partidaId,
        anio: row.anio,
        indice: row.indice,
        cantidaNroCont: row.cantidaNroCont ?? 0,
        detalleExtendido: row.detalleExtendido ?? "",
        f_siembra: new Date(),
        edita: "S",
        lote: row.lote ?? 0,
        anoLote: row.anoLote ?? 0,
        item: row.item ?? 0,
        semxgr: row.semxgr ?? 0,
        ajuste: row.ajuste ?? "",
        cantidadGrs: row.cantidadGrs ?? 0,
        cg: row.cg ?? 0,
        prensadoSemilla: row.prensadoSemilla,
        profundidadSemilla: row.profundidadSemilla,
        metodoMaquina: row.metodoMaquina,
        tratamientoSemilla: row.tratamientoSemilla,
        entityId: entity.id,
      });
      setSlideOpen(true);
    },
    [formCompletar, entity],
  );

  const handleCompletar = async (formData: AsignarUbiSiembraCompletaDto) => {
    if (selectedPartida) {
      try {
        await completarSiembra({ id: selectedPartida.id, data: formData });
        setSlideOpen(false);
      } catch {}
    }
  };

  const handleOpenChange = useCallback((open: boolean) => {
    setSlideOpen(open);
    if (!open) {
      setSelectedPartida(null);
    }
  }, []);

  return (
    <>
      <DataTable
        columns={aSembrarColumns}
        data={sortedPartidas}
        title="A Sembrar"
        description="Partidas autorizadas pendientes de completar siembra"
        tableName="a_sembrar"
        totalCount={sortedPartidas.length}
        exportColumns={aSembrarExportColumns}
        onEdit={handleEdit}
        canExecuteLabel="Completar Siembra"
        columnLabels={fieldLabels.ASembrar}
      />

      {selectedPartida && (
        <SlideOverForm
          open={slideOverOpen}
          onOpenChange={handleOpenChange}
          title={`Completar Siembra — Partida Nº ${selectedPartida.partidaId}`}
          formId="a-sembrar-form"
          mode="edit"
          form={formCompletar}
          saveLabel="Completar Siembra"
          fieldLabels={fieldLabels.AsignarUbiSiembraCompleta}
          confirm={{
            title: "Confirmar siembra",
            description: "¿Deseas confirmar siembra?",
            label: "Completar Siembra",
            summaryFields: ["cg", "f_siembra", "cantidaNroCont", "cantidadGrs", "ajuste", "prensadoSemilla", "profundidadSemilla", "tratamientoSemilla", "metodoMaquina", "detalleExtendido"],
          }}
        >
          <div className="space-y-2">
            <ASembrarEditForm
              form={formCompletar}
              onSubmit={handleCompletar}
              onCancel={() => setSlideOpen(false)}
              selectedPartida={selectedPartida}
            />
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
