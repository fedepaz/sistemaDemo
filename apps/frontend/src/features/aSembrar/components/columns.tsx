"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SiembraPartidaDto } from "@vivero/shared";
import { Badge } from "@/components/ui/badge";
import type { ExportColumn } from "@/lib/export/types";
import { SortableHeader } from "@/components/data-display/data-table";
import { formatShortDate } from "@/lib/date-utils";

export const aSembrarColumns: ColumnDef<SiembraPartidaDto>[] = [
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
    accessorKey: "cantidaNroCont",
    header: ({ column }) => (
      <SortableHeader column={column}>Cant.</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm text-muted-foreground">
        {row.original.cantidaNroCont || "-"}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "fSiembra",
    header: ({ column }) => (
      <SortableHeader column={column}>F. Siembra</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {formatShortDate(row.original.fSiembra)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader column={column}>Creado</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {formatShortDate(row.original.createdAt)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "usuarioNombre",
    header: ({ column }) => (
      <SortableHeader column={column}>Usuario</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        {row.original.usuarioNombre || "-"}
      </span>
    ),
  },
];

export const aSembrarExportColumns: ExportColumn<SiembraPartidaDto>[] = [
  {
    accessorKey: "partidaId",
    exportHeader: "Partida",
    exportValue: (_value, row) => `${row.partidaId}/${row.indice}`,
    pdfWidth: "15%",
  },
  {
    accessorKey: "nombreEspecie",
    exportHeader: "Especie",
    exportValue: (_value, row) => `${row.nombreEspecie} (${row.codigoEspecie})`,
    pdfWidth: "20%",
  },
  {
    accessorKey: "cantidaNroCont",
    exportHeader: "Cant. Cont.",
    pdfWidth: "12%",
  },
  {
    accessorKey: "fSiembra",
    exportHeader: "F. Siembra",
    exportValue: (value) => formatShortDate(value as string),
    pdfWidth: "18%",
  },
  {
    accessorKey: "usuarioNombre",
    exportHeader: "Autorizado por",
    pdfWidth: "25%",
  },
];
