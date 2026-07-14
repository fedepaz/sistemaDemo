// src/features/alerts/components/alerts-data-table.tsx
"use client";

import { DataTable } from "@/components/data-display/data-table";
import type { ColumnDef } from "@tanstack/react-table";

interface AlertsDataTableProps<TData> {
  title: string;
  description: string;
  columns: ColumnDef<TData>[];
  data: TData[];
}

export function AlertsDataTable<TData>({
  title,
  description,
  columns,
  data,
}: AlertsDataTableProps<TData>) {
  return (
    <DataTable
      columns={columns}
      data={data}
      title={title}
      description={description}
      tableName="alerts"
      totalCount={data.length}
    />
  );
}
