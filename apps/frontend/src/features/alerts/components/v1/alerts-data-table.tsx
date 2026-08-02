// src/features/alerts/components/alerts-data-table.tsx
"use client";

import { DataTable } from "@/components/data-display/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { ExportColumn } from "@/lib/export/types";

interface AlertsDataTableProps<TData extends Record<string, unknown>> {
  title: string;
  description: string;
  columns: ColumnDef<TData>[];
  data: TData[];
  exportColumns?: ExportColumn<TData>[];
}

export function AlertsDataTable<TData extends Record<string, unknown>>({
  title,
  description,
  columns,
  data,
  exportColumns,
}: AlertsDataTableProps<TData>) {
  return (
    <DataTable
      columns={columns}
      data={data}
      title={title}
      description={description}
      tableName="alerts"
      totalCount={data.length}
      exportColumns={exportColumns}
    />
  );
}
