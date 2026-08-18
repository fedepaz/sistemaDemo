// src/features/siembra/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import { SiembraDto } from "@vivero/shared";
import type { ExportColumn } from "@/lib/export/types";
import { formatShortDate } from "@/lib/date-utils";

export const partidaSiembraColumns: ColumnDef<SiembraDto>[] = [
  {
    accessorKey: "partidaId",
    header: ({ column }) => (
      <SortableHeader column={column}>Partida</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="font-black text-sm text-foreground/80 tracking-tight">
        #{row.original.partidaId}
        {row.original.indice !== 0 && `/ ${row.original.indice}`}
      </div>
    ),
    size: 70,
  },
  {
    accessorKey: "codigoEspecie",
    header: ({ column }) => (
      <SortableHeader column={column}>Código</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm">
        {row.original.codigoEspecie}
      </span>
    ),
  },
  {
    accessorKey: "nombreEspecie",
    header: ({ column }) => (
      <SortableHeader column={column}>Especie</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        {row.original.nombreEspecie}
      </span>
    ),
  },

  {
    accessorKey: "con",
    header: ({ column }) => (
      <SortableHeader column={column}>Cantidad</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono">{row.original.con}</span>
    ),
  },

  {
    accessorKey: "fechaSugeridaSiembra",
    header: ({ column }) => {
      return <SortableHeader column={column}>Siembra Sug.</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-muted-foreground group">
        <span className="text-xs font-bold font-mono tracking-tighter">
          {formatShortDate(row.original.fechaSugeridaSiembra)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "fechaSiembraReal",
    header: ({ column }) => {
      return <SortableHeader column={column}>Siembra Real</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-muted-foreground group">
        <span className="text-xs font-bold font-mono tracking-tighter">
          {formatShortDate(row.original.fechaSiembraReal)}
        </span>
      </div>
    ),
  },
];

export const partidaSiembraExportColumns: ExportColumn<SiembraDto>[] = [
  { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "8%" },
  { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "10%" },
  { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "15%" },
  { accessorKey: "con", exportHeader: "Cantidad", pdfWidth: "10%" },
  {
    accessorKey: "injerto",
    exportHeader: "Injerto",
    exportValue: (value) => (value === "N" ? "" : (value as string)),
    pdfWidth: "9%",
  },

  {
    accessorKey: "fechaSugeridaSiembra",
    exportHeader: "Siembra Sugerida",
    exportValue: (value) => formatShortDate(value as string),
    pdfWidth: "13%",
  },
  {
    accessorKey: "fechaSiembraReal",
    exportHeader: "Siembra Real",
    exportValue: (value) => formatShortDate(value as string),
    pdfWidth: "13%",
  },
];
