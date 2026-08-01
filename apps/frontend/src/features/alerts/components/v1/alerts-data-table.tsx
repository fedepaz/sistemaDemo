// src/features/alerts/components/v1/alerts-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { ExportColumn } from "@/lib/export/types";
import { useState } from "react";
import type { AlertBaseDto } from "@vivero/shared";
import { AlertsViewForm } from "./alerts-view-form";
import { AlertEditForm } from "./alert-edit-form";
import type { AlertType } from "@/features/alerts/types";

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

  const resolvedAlertType: AlertType =
    ALERT_TYPE_SLUG_TO_ENUM[alertType] ?? (alertType as AlertType);

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
      {selectedAlert && mode === "view" && (
        <AlertsViewForm
          open={slideOverOpen}
          onOpenChange={handleOpenChange}
          alert={selectedAlert}
          alertType={resolvedAlertType}
        />
      )}
      {selectedAlert && mode === "edit" && (
        <SlideOverForm
          open={slideOverOpen}
          onOpenChange={handleOpenChange}
          title={`Partida #${selectedAlert.partidaId}/${selectedAlert.indice}`}
          formId=""
          mode={mode}
        >
          <AlertEditForm
            alert={selectedAlert}
            alertType={resolvedAlertType}
            onSubmitted={() => setSlideOpen(false)}
          />
        </SlideOverForm>
      )}
    </>
  );
}
