// src/features/plants/components/columns.tsx

import { Row, Table, type ColumnDef } from "@tanstack/react-table";
import {
  SortableHeader,
  StatusBadge,
} from "@/components/data-display/data-table";
import { Plant } from "../types";

interface CellProps {
  row?: Row<Plant>;
  table?: Table<Plant>;
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
    status === "healthy"
      ? "Operativo"
      : status === "warning"
        ? "Atención"
        : "Crítico";
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
    accessorKey: "name",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Nombre" />;
    },
  },
  {
    accessorKey: "species",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Tipo" />;
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
      return <HeaderComponent column={column} translationKey="Fase" />;
    },
  },
  {
    accessorKey: "plantedDate",
    header: ({ column }) => {
      return (
        <HeaderComponent column={column} translationKey="Fecha Registro" />
      );
    },
  },
  {
    accessorKey: "lastWatered",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Actualización" />;
    },
  },
];
