// src/features/entities/components/columns.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { Entity } from "@vivero/shared";

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
    header: "Nombre",
    cell: ({ row }) => row.getValue("name"),
  },
  {
    accessorKey: "label",
    header: "Etiqueta",
    cell: ({ row }) => row.getValue("label"),
  },
  {
    accessorKey: "permissionType",
    header: "Tipo de permiso",
    cell: ({ row }) => row.getValue("permissionType"),
  },
];
