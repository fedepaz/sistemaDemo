// src/features/extendidos/components/columns.tsx

import { type ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import { PartidaDto } from "@vivero/shared";

export const partidaColumns: ColumnDef<PartidaDto>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return <SortableHeader column={column}>Partida</SortableHeader>;
    },
  },
  {
    accessorKey: "productCode",
    header: ({ column }) => {
      return <SortableHeader column={column}>Especie</SortableHeader>;
    },
  },
  {
    accessorKey: "productName",
    header: ({ column }) => {
      return <SortableHeader column={column}>Producto</SortableHeader>;
    },
  },
  {
    accessorKey: "suggestedSowingDate",
    header: ({ column }) => {
      return (
        <SortableHeader column={column}>Fecha siembra sugerida</SortableHeader>
      );
    },
  },
  {
    accessorKey: "actualSowingDate",
    header: ({ column }) => {
      return (
        <SortableHeader column={column}>Fecha real de siembra</SortableHeader>
      );
    },
  },
  {
    accessorKey: "daysInChamber",
    header: ({ column }) => {
      return <SortableHeader column={column}>Días de cámara</SortableHeader>;
    },
  },
  {
    accessorKey: "traysSown",
    header: ({ column }) => {
      return (
        <SortableHeader column={column}>Bandejas sembradas</SortableHeader>
      );
    },
  },
  {
    accessorKey: "greenhouseCode",
    header: ({ column }) => {
      return <SortableHeader column={column}>Códgo Invernadero</SortableHeader>;
    },
  },
  {
    accessorKey: "traysExtended",
    header: ({ column }) => {
      return (
        <SortableHeader column={column}>Bandejas extendidas</SortableHeader>
      );
    },
  },
];
