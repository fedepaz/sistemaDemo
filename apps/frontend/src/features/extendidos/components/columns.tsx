// src/features/extendidos/components/columns.tsx

import { Row, Table, type ColumnDef } from "@tanstack/react-table";
import {
  SortableHeader,
  StatusBadge,
} from "@/components/data-display/data-table";
import { PartidaExample } from "../types";

interface CellProps {
  row?: Row<PartidaExample>;
  table?: Table<PartidaExample>;
}

export const partidaExampleColumns: ColumnDef<PartidaExample>[] = [
  {
    accessorKey: "partida",
    header: ({ column }) => {
      return <SortableHeader column={column}>Partida</SortableHeader>;
    },
  },
  {
    accessorKey: "ano",
    header: ({ column }) => {
      return <SortableHeader column={column}>Año</SortableHeader>;
    },
  },
  {
    accessorKey: "indice",
    header: ({ column }) => {
      return <SortableHeader column={column}>Índice</SortableHeader>;
    },
  },
  {
    accessorKey: "fecha",
    header: ({ column }) => {
      return <SortableHeader column={column}>Fecha</SortableHeader>;
    },
  },
  {
    accessorKey: "contenedor",
    header: ({ column }) => {
      return <SortableHeader column={column}>Contenedor</SortableHeader>;
    },
  },
  {
    accessorKey: "hai",
    header: ({ column }) => {
      return <SortableHeader column={column}>H.A.I.</SortableHeader>;
    },
  },
  {
    accessorKey: "injerto",
    header: ({ column }) => {
      return <SortableHeader column={column}>Injerto</SortableHeader>;
    },
  },
];
