// src/features/entities/components/columns.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { Entity } from "@vivero/shared";
import {
  SortableHeader,
  StatusBadge,
} from "@/components/data-display/data-table";

interface CellProps {
  row?: Row<Entity>;
  table?: Table<Entity>;
}

function CellComponent({ row, table }: CellProps) {
  if (row) {
    return (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    );
  }
  if (table) {
    return (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    );
  }
  if (!row || !table) return null;
}

export const entityColumns: ColumnDef<Entity>[] = [
  {
    id: "select",
    header: ({ table }) => {
      return <CellComponent table={table} />;
    },
    cell: ({ row }) => {
      return <CellComponent row={row} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column}>Nombre</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "label",
    header: ({ column }) => (
      <SortableHeader column={column}>Etiqueta</SortableHeader>
    ),
    cell: ({ row }) => row.getValue("label"),
  },
  {
    accessorKey: "permissionType",
    header: ({ column }) => (
      <SortableHeader column={column}>Tipo de permiso</SortableHeader>
    ),
    cell: ({ row }) => {
      const type = row.getValue("permissionType") as string;
      const statusMap = {
        CRUD: "healthy",
        PROCESS: "info",
        READ_ONLY: "warning",
      } as const;

      return (
        <StatusBadge status={statusMap[type as keyof typeof statusMap]}>
          {type}
        </StatusBadge>
      );
    },
  },
];
