// src/features/alerts/components/v1/alerts-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { ExportColumn } from "@/lib/export/types";
import { useEffect, useState } from "react";
import { useAlertCommentsMutation } from "../../hooks/useAlertCommentsMutation";
import type { AlertBaseDto, CreateAlertCommentDto } from "@vivero/shared";
import { CreateAlertCommentSchema } from "@vivero/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertsViewForm } from "./alerts-view-form";
import { AlertEditForm } from "./alert-edit-form";

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

  const { mutateAsync: createAlertComment, isPending } =
    useAlertCommentsMutation();

  const formAlertComment = useForm<CreateAlertCommentDto>({
    resolver: zodResolver(CreateAlertCommentSchema),
  });

  useEffect(() => {
    if (selectedAlert) {
      formAlertComment.reset({
        alertType: alertType.toUpperCase().replace(/-/g, "_") as CreateAlertCommentDto["alertType"],
        partidaId: selectedAlert.partidaId,
        anio: selectedAlert.anio,
        indice: selectedAlert.indice,
        content: "",
      });
    }
  }, [selectedAlert, alertType, formAlertComment]);

  const handleCreateAlertComment = async (formData: CreateAlertCommentDto) => {
    try {
      await createAlertComment(formData);
      setSlideOpen(false);
    } catch {
      // error toast handled by mutation hook
    }
  };

  const handleAlertView = (row: TData) => {
    setSelectedAlert(row);
    setMode("view");
    setSlideOpen(true);
  };

  const handleAlertComment = (row: TData) => {
    setSelectedAlert(row);
    setMode("edit");
    setSlideOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setSlideOpen(open);
    if (!open) {
      setSelectedAlert(null);
    }
  };

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
          form={formAlertComment}
          isLoading={isPending}
          saveLabel="Confirmar Comentario"
        >
          {mode === "view" ? (
            <AlertsViewForm selectedAlert={selectedAlert} alertType={alertType} />
          ) : (
            <AlertEditForm
              form={formAlertComment}
              onSubmit={handleCreateAlertComment}
              onCancel={() => setSlideOpen(false)}
              selectedAlert={selectedAlert}
            />
          )}
        </SlideOverForm>
      )}
    </>
  );
}
