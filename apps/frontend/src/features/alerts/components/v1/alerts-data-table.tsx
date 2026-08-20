// src/features/alerts/components/v1/alerts-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { ExportColumn } from "@/lib/export/types";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import type { AlertBaseDto, CreateAlertCommentDto } from "@vivero/shared";
import { AlertsViewForm } from "./alerts-view-form";
import { AlertEditForm } from "./alert-edit-form";
import type { AlertType } from "@/features/alerts/types";
import { useAlertCommentsMutation } from "@/features/alerts/hooks/useAlertCommentsMutation";
import { usePermission } from "@/hooks/usePermission";
import { AlertSolvedButton } from "../shared/alert-solved-button";

const ALERT_TYPE_SLUG_TO_ENUM: Record<string, AlertType> = {
  "siembra-retrasada": "SIEMBRA_RETRASADA",
  "falta-germinacion": "FALTA_GERMINACION",
  "faltante-plantas": "FALTANTE_PLANTAS",
  "falta-pre-expedicion": "FALTA_PRE_EXPEDICION",
};

interface AlertsDataTableProps<TData extends AlertBaseDto> {
  title: string;
  description: string;
  alertType: string;
  columns: ColumnDef<TData>[];
  data: TData[];
  exportColumns?: ExportColumn<TData>[];
}

export function AlertsDataTable<TData extends AlertBaseDto>({
  title,
  description,
  alertType,
  columns,
  data,
  exportColumns,
}: AlertsDataTableProps<TData>) {
  const [slideOverOpen, setSlideOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<TData | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const { canCreate } = usePermission("alerts");

  const form = useForm<CreateAlertCommentDto>({
    defaultValues: { content: "" },
  });

  const { mutate: createComment } = useAlertCommentsMutation();

  const handleCommentSubmit = (data: CreateAlertCommentDto) => {
    if (!selectedAlert) return;
    createComment(
      {
        ...data,
        alertType: resolvedAlertType,
        partidaId: selectedAlert.partidaId,
        anio: selectedAlert.anio,
        indice: selectedAlert.indice,
      },
      {
        onSuccess: () => {
          form.reset({ content: "" });
          setSlideOpen(false);
        },
      },
    );
  };

  const resolvedAlertType: AlertType =
    ALERT_TYPE_SLUG_TO_ENUM[alertType] ?? (alertType as AlertType);

  const handleAlertView = useCallback((row: TData) => {
    setSelectedAlert(row);
    setMode("view");
    setSlideOpen(true);
  }, []);

  const handleAlertComment = useCallback((row: TData) => {
    setSelectedAlert(row);
    setMode("edit");
    form.reset({ content: "" });
    setSlideOpen(true);
  }, [form]);

  const handleOpenChange = useCallback((open: boolean) => {
    setSlideOpen(open);
    if (!open) {
      setSelectedAlert(null);
    }
  }, []);

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        title={title}
        description={description}
        tableName="alerts"
        totalCount={data.length}
        onView={handleAlertView}
        onEdit={handleAlertComment}
        canExecuteLabel="Agregar Comentario"
        exportColumns={exportColumns}
      />
      {selectedAlert && (
        <SlideOverForm
          open={slideOverOpen}
          onOpenChange={handleOpenChange}
          title={`Partida #${selectedAlert.partidaId}/${selectedAlert.indice}`}
          formId="alert-comment-form"
          mode={mode}
          form={form}
          saveLabel="Agregar Comentario"
        >
          <div className="space-y-2">
            {mode === "view" ? (
              <AlertsViewForm
                selectedAlert={selectedAlert}
                alertType={resolvedAlertType}
              />
            ) : (
              <div className="space-y-2">
                <AlertEditForm
                  selectedAlert={selectedAlert}
                  alertType={resolvedAlertType}
                  alertCommentsForm={form}
                  onSubmit={handleCommentSubmit}
                />
                {canCreate &&
                  selectedAlert.partidaId &&
                  resolvedAlertType === "FALTANTE_PLANTAS" && (
                    <div className="pt-4 border-t">
                      <AlertSolvedButton
                        selectedAlert={selectedAlert}
                        onSuccess={() => setSlideOpen(false)}
                      />
                    </div>
                  )}
              </div>
            )}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
