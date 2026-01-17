// src/features/plants/components/columns.tsx

import { Row, Table, type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SortableHeader,
  StatusBadge,
} from "@/components/data-display/data-table";
import { Plant } from "../types";

interface CellProps {
  row?: Row<Plant>;
  table?: Table<Plant>;
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

interface HeaderProps {
  column: ColumnDef<Plant>;
  translationKey: string;
}

function HeaderComponent({ column, translationKey }: HeaderProps) {
  return <SortableHeader column={column}>{translationKey}</SortableHeader>;
}

function CellBadgeComponent({ row }: CellProps) {
  if (!row) return null;
  const status = row.getValue("status") as string;
  const statusText =
    status === "healthy" ? "Saludable" : status === "warning" ? "Advertencia" : "Crítico";
  return (
    <StatusBadge
      status={row.getValue("status") as "healthy" | "warning" | "critical"}
    >
      {statusText}
    </StatusBadge>
  );
}

export const plantColumns: ColumnDef<Plant>[] = [
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
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Nombre" />;
    },
  },
  {
    accessorKey: "species",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Especie" />;
    },
  },
  {
    accessorKey: "location",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Ubicación" />;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Estado" />;
    },
    cell: ({ row }) => {
      return <CellBadgeComponent row={row} />;
    },
  },
  {
    accessorKey: "growthStage",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Etapa de crecimiento" />;
    },
  },
  {
    accessorKey: "plantedDate",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Fecha de siembra" />;
    },
  },
  {
    accessorKey: "lastWatered",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Último riego" />;
    },
  },
];
