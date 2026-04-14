// src/features/extendidos/components/columns.tsx

import { type ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import { PartidaDto } from "@vivero/shared";

export const partidaColumns: ColumnDef<PartidaDto>[] = [
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
