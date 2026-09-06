"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
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
        <div className="font-black text-sm text-foreground/80 tracking-tight">
          #{row.original.partidaId}
          {row.original.indice !== 0 && `/ ${row.original.indice}`}
        </div>
      ),
      size: 70,
    },
    {
      accessorKey: "anio",
      header: ({ column }) => (
        <SortableHeader column={column}>Año</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="font-mono font-bold text-sm">{row.original.anio}</span>
      ),
      size: 60,
    },
    {
      accessorKey: "presionSemilla",
      header: ({ column }) => (
        <SortableHeader column={column}>Presión (PSI)</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="font-mono font-bold text-sm tabular-nums">
          {row.original.presionSemilla}
        </span>
      ),
      size: 90,
    },
    {
      accessorKey: "profundidadSemilla",
      header: ({ column }) => (
        <SortableHeader column={column}>Profundidad (cm)</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="font-mono font-bold text-sm tabular-nums">
          {row.original.profundidadSemilla}
        </span>
      ),
      size: 110,
    },
    {
      accessorKey: "mezclaNombre",
      header: ({ column }) => (
        <SortableHeader column={column}>Mezcla</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="text-sm font-semibold">
          {row.original.mezclaNombre}
        </span>
      ),
    },
    {
      accessorKey: "usuarioNombre",
      header: ({ column }) => (
        <SortableHeader column={column}>Usuario</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="text-sm font-semibold">
          {row.original.usuarioNombre}
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
      pdfWidth: "12%",
    },
    { accessorKey: "anio", exportHeader: "Año", pdfWidth: "8%" },
    {
      accessorKey: "presionSemilla",
      exportHeader: "Presión (PSI)",
      pdfWidth: "12%",
    },
    {
      accessorKey: "profundidadSemilla",
      exportHeader: "Profundidad (cm)",
      pdfWidth: "14%",
    },
    { accessorKey: "mezclaNombre", exportHeader: "Mezcla", pdfWidth: "28%" },
    {
      accessorKey: "usuarioNombre",
      exportHeader: "Usuario",
      pdfWidth: "16%",
    },
  ];
