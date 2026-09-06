"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/date-utils";
import { SiembraPartidaDto } from "@vivero/shared";
import type { ExportColumn } from "@/lib/export/types";

export const siembraPartidasRegistradasColumns: ColumnDef<SiembraPartidaDto>[] =
  [
    {
      accessorKey: "partidaId",
      header: ({ column }) => (
        <SortableHeader column={column}>Partida</SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-black text-sm text-foreground/80 tracking-tight">
            #{row.original.partidaId}
          </span>
          <span className="text-[9px] font-bold text-muted-foreground">
            / {row.original.indice}
          </span>
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: "lote",
      header: ({ column }) => (
        <SortableHeader column={column}>Lote</SortableHeader>
      ),
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className="font-mono text-xs font-bold px-2 py-0.5"
        >
          {row.original.lote}
        </Badge>
      ),
      size: 70,
    },
    {
      accessorKey: "cg",
      header: ({ column }) => (
        <SortableHeader column={column}>Cámara</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="font-mono font-bold text-sm text-muted-foreground">
          {row.original.cg || "-"}
        </span>
      ),
      size: 60,
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

export const siembraPartidasRegistradasExportColumns: ExportColumn<SiembraPartidaDto>[] =
  [
    {
      accessorKey: "partidaId",
      exportHeader: "Partida",
      exportValue: (_value, row) => `${row.partidaId}/${row.indice}`,
      pdfWidth: "15%",
    },
    { accessorKey: "lote", exportHeader: "Lote", pdfWidth: "12%" },
    { accessorKey: "cg", exportHeader: "CG", pdfWidth: "10%" },
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
      exportHeader: "Usuario",
      pdfWidth: "25%",
    },
  ];
