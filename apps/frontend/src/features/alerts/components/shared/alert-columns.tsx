// src/features/alerts/components/alert-columns.tsx
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import type { ExportColumn } from "@/lib/export/types";
import {
  SiembraRetrasadaDto,
  FaltaGerminacionDto,
  FaltantePlantasDto,
  FaltaPreExpedicionDto,
} from "@vivero/shared";

// ============================================================================
// SIEMBRA RETRASADA
// ============================================================================

export const siembraRetrasadaColumns: ColumnDef<SiembraRetrasadaDto>[] = [
  {
    accessorKey: "partidaId",
    header: ({ column }) => {
      return <SortableHeader column={column}>Partida</SortableHeader>;
    },
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
    header: ({ column }) => {
      return <SortableHeader column={column}>Código</SortableHeader>;
    },
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm">
        {row.original.codigoEspecie}
      </span>
    ),
  },
  {
    accessorKey: "nombreEspecie",
    header: ({ column }) => {
      return <SortableHeader column={column}>Especie</SortableHeader>;
    },
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{row.original.nombreEspecie}</span>
    ),
  },
  {
    accessorKey: "fechaSugeridaSiembra",
    header: ({ column }) => {
      return <SortableHeader column={column}>Fecha Sug. Siembra</SortableHeader>;
    },
    cell: ({ row }) => (
      <span className="text-xs font-bold font-mono text-muted-foreground">
        {row.original.fechaSugeridaSiembra}
      </span>
    ),
  },
  {
    accessorKey: "contenedor",
    header: ({ column }) => {
      return <SortableHeader column={column}>Contenedor</SortableHeader>;
    },
    size: 100,
  },
  {
    accessorKey: "con",
    header: ({ column }) => {
      return <SortableHeader column={column}>Cantidad</SortableHeader>;
    },
    size: 100,
  },
];

// ============================================================================
// FALTA RECUENTO GERMINACION
// ============================================================================

export const faltaGerminacionColumns: ColumnDef<FaltaGerminacionDto>[] = [
  {
    accessorKey: "partidaId",
    header: ({ column }) => {
      return <SortableHeader column={column}>Partida</SortableHeader>;
    },
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
    header: ({ column }) => {
      return <SortableHeader column={column}>Código</SortableHeader>;
    },
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm">
        {row.original.codigoEspecie}
      </span>
    ),
  },
  {
    accessorKey: "nombreEspecie",
    header: ({ column }) => {
      return <SortableHeader column={column}>Especie</SortableHeader>;
    },
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{row.original.nombreEspecie}</span>
    ),
  },
  {
    accessorKey: "contenedor",
    header: ({ column }) => {
      return <SortableHeader column={column}>Contenedor</SortableHeader>;
    },
    size: 100,
  },
  {
    accessorKey: "invernadero",
    header: ({ column }) => {
      return <SortableHeader column={column}>Invernadero</SortableHeader>;
    },
    size: 100,
  },
];

// ============================================================================
// FALTANTE ESTIMADO DE PLANTAS
// ============================================================================

export const faltantePlantasColumns: ColumnDef<FaltantePlantasDto>[] = [
  {
    accessorKey: "partidaId",
    header: ({ column }) => {
      return <SortableHeader column={column}>Partida</SortableHeader>;
    },
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
    header: ({ column }) => {
      return <SortableHeader column={column}>Código</SortableHeader>;
    },
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm">
        {row.original.codigoEspecie}
      </span>
    ),
  },
  {
    accessorKey: "nombreEspecie",
    header: ({ column }) => {
      return <SortableHeader column={column}>Especie</SortableHeader>;
    },
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{row.original.nombreEspecie}</span>
    ),
  },
  {
    accessorKey: "solicitadas",
    header: ({ column }) => {
      return <SortableHeader column={column}>Solicitadas</SortableHeader>;
    },
    size: 100,
  },
  {
    accessorKey: "germinadasTotales",
    header: ({ column }) => {
      return <SortableHeader column={column}>Germinadas</SortableHeader>;
    },
    size: 100,
  },
  {
    accessorKey: "invernadero",
    header: ({ column }) => {
      return <SortableHeader column={column}>Invernadero</SortableHeader>;
    },
    size: 100,
  },
];

// ============================================================================
// FALTA PRE-EXPEDICION
// ============================================================================

export const faltaPreExpedicionColumns: ColumnDef<FaltaPreExpedicionDto>[] = [
  {
    accessorKey: "partidaId",
    header: ({ column }) => {
      return <SortableHeader column={column}>Partida</SortableHeader>;
    },
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
    header: ({ column }) => {
      return <SortableHeader column={column}>Código</SortableHeader>;
    },
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm">
        {row.original.codigoEspecie}
      </span>
    ),
  },
  {
    accessorKey: "nombreEspecie",
    header: ({ column }) => {
      return <SortableHeader column={column}>Especie</SortableHeader>;
    },
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{row.original.nombreEspecie}</span>
    ),
  },
  {
    accessorKey: "fechaEntrega",
    header: ({ column }) => {
      return <SortableHeader column={column}>Fecha Entrega</SortableHeader>;
    },
    cell: ({ row }) => (
      <span className="text-xs font-bold font-mono text-muted-foreground">
        {row.original.fechaEntrega}
      </span>
    ),
  },
  {
    accessorKey: "invernadero",
    header: ({ column }) => {
      return <SortableHeader column={column}>Invernadero</SortableHeader>;
    },
    size: 100,
  },
];

// ============================================================================
// EXPORT COLUMNS
// ============================================================================

export const siembraRetrasadaExportColumns: ExportColumn<SiembraRetrasadaDto>[] = [
  { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "10%" },
  { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "12%" },
  { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "18%" },
  { accessorKey: "fechaSugeridaSiembra", exportHeader: "Fecha Sug. Siembra", pdfWidth: "20%" },
  { accessorKey: "contenedor", exportHeader: "Contenedor", pdfWidth: "16%" },
  { accessorKey: "con", exportHeader: "Cantidad", pdfWidth: "10%" },
];

export const faltaGerminacionExportColumns: ExportColumn<FaltaGerminacionDto>[] = [
  { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "12%" },
  { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "15%" },
  { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "20%" },
  { accessorKey: "contenedor", exportHeader: "Contenedor", pdfWidth: "18%" },
  { accessorKey: "invernadero", exportHeader: "Invernadero", pdfWidth: "18%" },
];

export const faltantePlantasExportColumns: ExportColumn<FaltantePlantasDto>[] = [
  { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "10%" },
  { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "12%" },
  { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "18%" },
  { accessorKey: "solicitadas", exportHeader: "Solicitadas", pdfWidth: "14%" },
  { accessorKey: "germinadasTotales", exportHeader: "Germinadas", pdfWidth: "14%" },
  { accessorKey: "invernadero", exportHeader: "Invernadero", pdfWidth: "14%" },
];

export const faltaPreExpedicionExportColumns: ExportColumn<FaltaPreExpedicionDto>[] = [
  { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "12%" },
  { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "15%" },
  { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "20%" },
  { accessorKey: "fechaEntrega", exportHeader: "Fecha Entrega", pdfWidth: "18%" },
  { accessorKey: "invernadero", exportHeader: "Invernadero", pdfWidth: "18%" },
];
