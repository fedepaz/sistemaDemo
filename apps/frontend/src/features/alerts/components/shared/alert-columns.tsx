"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import type { ExportColumn } from "@/lib/export/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatShortDate, getLocalDateStr } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";
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
    accessorKey: "nrocont",
    header: ({ column }) => (
      <SortableHeader column={column}>Cantidad</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono">{row.original.nrocont}</span>
    ),
  },

  {
    accessorKey: "fechaSugeridaSiembra",
    header: ({ column }) => (
      <SortableHeader column={column}>Fecha Sug. Siembra</SortableHeader>
    ),
    cell: ({ row }) => {
      const today = new Date();
      const todayStr = getLocalDateStr(today);
      const targetDate = row.original.fechaSugeridaSiembra;
      const isPastDue = targetDate < todayStr;

      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold font-mono text-muted-foreground">
            {formatShortDate(targetDate)}
          </span>
          {isPastDue && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative flex h-2 w-2 cursor-help">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Siembra sugerida pasada</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "semSiembra",
    header: ({ column }) => (
      <SortableHeader column={column}>Sem Siembra</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono">{row.original.semSiembra}</span>
    ),
  },
  {
    accessorKey: "propiedad",
    header: ({ column }) => (
      <SortableHeader column={column}>Propiedad</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-bold uppercase tracking-wider">
        {row.original.propiedad}
      </span>
    ),
  },
];

// ============================================================================
// FALTA RECUENTO GERMINACION
// ============================================================================

export const faltaGerminacionColumns: ColumnDef<FaltaGerminacionDto>[] = [
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
    accessorKey: "nrocont",
    header: ({ column }) => (
      <SortableHeader column={column}>Cantidad</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono">{row.original.nrocont}</span>
    ),
  },
  {
    accessorKey: "fPrimer",
    header: ({ column }) => (
      <SortableHeader column={column}>Fecha Primer</SortableHeader>
    ),
    cell: ({ row }) => {
      const today = new Date();
      const todayStr = getLocalDateStr(today);
      const targetDate = row.original.fPrimer;
      const isToday = targetDate === todayStr;

      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold font-mono text-muted-foreground">
            {formatShortDate(targetDate)}
          </span>
          {isToday && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative flex h-2 w-2 cursor-help">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Fecha primer hoy</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    },
  },
];

// ============================================================================
// FALTANTE ESTIMADO DE PLANTAS
// ============================================================================

export const faltantePlantasColumns: ColumnDef<FaltantePlantasDto>[] = [
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
    accessorKey: "nrocont",
    header: ({ column }) => (
      <SortableHeader column={column}>Cantidad</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono">{row.original.nrocont}</span>
    ),
  },
  {
    accessorKey: "solicito",
    header: ({ column }) => (
      <SortableHeader column={column}>Solicitadas</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono text-right">
        {row.original.solicito}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "producido",
    header: ({ column }) => (
      <SortableHeader column={column}>Producido</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono">{row.original.producido}</span>
    ),
  },

  {
    accessorKey: "diferencia",
    header: ({ column }) => (
      <SortableHeader column={column}>Diferencia</SortableHeader>
    ),
    cell: ({ row }) => {
      const diff = row.original.diferencia;

      return (
        <span className="text-xs font-mono font-bold text-right text-destructive">
          {diff > 0 ? `-${diff}` : diff}
        </span>
      );
    },
  },
];

// ============================================================================
// FALTA PRE-EXPEDICION
// ============================================================================

export const faltaPreExpedicionColumns: ColumnDef<FaltaPreExpedicionDto>[] = [
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
    accessorKey: "nrocont",
    header: ({ column }) => (
      <SortableHeader column={column}>Cantidad</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono">{row.original.nrocont}</span>
    ),
  },
  {
    accessorKey: "fPreexp",
    header: ({ column }) => (
      <SortableHeader column={column}>Fecha Pre-Exp</SortableHeader>
    ),
    cell: ({ row }) => {
      const today = new Date();
      const todayStr = getLocalDateStr(today);
      const targetDate = row.original.fPreexp;
      const isToday = targetDate === todayStr;

      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold font-mono text-muted-foreground">
            {formatShortDate(targetDate)}
          </span>
          {isToday && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative flex h-2 w-2 cursor-help">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Fecha pre-expedición hoy</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    },
  },
];

// ============================================================================
// EXPORT COLUMNS
// ============================================================================

export const siembraRetrasadaExportColumns: ExportColumn<SiembraRetrasadaDto>[] =
  [
    { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "8%" },
    { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "10%" },
    { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "15%" },
    { accessorKey: "nrocont", exportHeader: "Cantidad", pdfWidth: "10%" },

    {
      accessorKey: "fechaSugeridaSiembra",
      exportHeader: "Fecha Sug. Siembra",
      pdfWidth: "12%",
    },
    { accessorKey: "semEntrega", exportHeader: "Sem Entrega", pdfWidth: "12%" },
    { accessorKey: "propiedad", exportHeader: "Propiedad", pdfWidth: "8%" },
  ];

export const faltaGerminacionExportColumns: ExportColumn<FaltaGerminacionDto>[] =
  [
    { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "10%" },
    { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "12%" },
    { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "18%" },
    { accessorKey: "nrocont", exportHeader: "Cantidad", pdfWidth: "12%" },
    { accessorKey: "fPrimer", exportHeader: "Fecha Primer", pdfWidth: "15%" },
    { accessorKey: "pr", exportHeader: "PR", pdfWidth: "10%" },
  ];

export const faltantePlantasExportColumns: ExportColumn<FaltantePlantasDto>[] =
  [
    { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "8%" },
    { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "10%" },
    { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "15%" },
    { accessorKey: "nrocont", exportHeader: "Cantidad", pdfWidth: "10%" },
    { accessorKey: "solicito", exportHeader: "Solicitadas", pdfWidth: "10%" },
    { accessorKey: "producido", exportHeader: "Producido", pdfWidth: "10%" },
    { accessorKey: "diferencia", exportHeader: "Diferencia", pdfWidth: "10%" },
  ];

export const faltaPreExpedicionExportColumns: ExportColumn<FaltaPreExpedicionDto>[] =
  [
    { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "10%" },
    { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "12%" },
    { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "18%" },
    { accessorKey: "nrocont", exportHeader: "Cantidad", pdfWidth: "12%" },
    { accessorKey: "fPreexp", exportHeader: "Fecha Pre-Exp", pdfWidth: "15%" },
    { accessorKey: "pe", exportHeader: "PE", pdfWidth: "10%" },
  ];
