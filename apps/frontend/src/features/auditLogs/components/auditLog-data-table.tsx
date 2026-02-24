//src/features/users/components/user-data-table.tsx
"use client";

import {
  DataTable,
  DataTableSkeleton,
  SlideOverForm,
} from "@/components/data-display/data-table";
import { auditLogColumns } from "./columns";

import { AuditLogDto } from "@vivero/shared";
import { useAuditLogs } from "../hooks/auditLogHooks";
import { useState } from "react";
import { AuditLogForm } from "./auditLog-form";

export function AuditLogDataTable() {
  const { data: auditLogs, isLoading } = useAuditLogs();

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogDto>();

  const handleViewAuditLog = (row: AuditLogDto) => {
    setSelectedAuditLog(row);
    setSlideOverOpen(true);
  };

  const handleExport = (
    format: "csv" | "excel" | "json" | "pdf",
    selectedRows: AuditLogDto[],
  ) => {
    console.log("Export Users:", selectedRows);
  };

  if (auditLogs === undefined || isLoading)
    return <DataTableSkeleton columnCount={auditLogColumns.length} />;

  return (
    <>
      <DataTable
        columns={auditLogColumns}
        data={auditLogs}
        title="Auditoría"
        description="Log de auditoría del sistema"
        tableName="auditLog"
        totalCount={auditLogs.length}
        onExport={handleExport}
        onView={handleViewAuditLog}
      />
      {selectedAuditLog && (
        <SlideOverForm
          formId={`view-${selectedAuditLog.id}`}
          open={slideOverOpen}
          onOpenChange={setSlideOverOpen}
          title={`Log`}
          description={`Detalles del log de auditoría: ${selectedAuditLog.id}`}
          onCancel={() => setSlideOverOpen(false)}
          mode="view"
        >
          <AuditLogForm selectedAuditLog={selectedAuditLog} />
        </SlideOverForm>
      )}
    </>
  );
}
