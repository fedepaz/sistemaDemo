"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import type { ExportColumn } from "@/lib/export/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatShortDate, getLocalDateStr } from "@/lib/date-utils";
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
    accessorKey: "injerto",
    header: ({ column }) => (
      <SortableHeader column={column}>Injerto</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {row.original.injerto}
      </span>
    ),
  },
  {
    accessorKey: "nrocont",
    header: ({ column }) => (
      <SortableHeader column={column}>Nro Contenedor</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono">{row.original.nrocont}</span>
    ),
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
    accessorKey: "fechaSugeridaSiembra",
    header: ({ column }) => (
      <SortableHeader column={column}>Fecha Sug. Siembra</SortableHeader>
    ),
    cell: ({ row }) => {
      const today = new Date();
      const todayStr = getLocalDateStr(today);
      const targetDate = row.original.fechaSugeridaSiembra;
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
                <p>Siembra sugerida hoy</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "semEntrega",
    header: ({ column }) => (
      <SortableHeader column={column}>Sem Entrega</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono">{row.original.semEntrega}</span>
    ),
  },
  {
    accessorKey: "estado",
    header: ({ column }) => (
      <SortableHeader column={column}>Estado</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-bold uppercase tracking-wider">
        {row.original.estado}
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
    accessorKey: "injerto",
    header: ({ column }) => (
      <SortableHeader column={column}>Injerto</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {row.original.injerto}
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
            {targetDate}
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
    accessorKey: "hai",
    header: ({ column }) => (
      <SortableHeader column={column}>HAI</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono">{row.original.hai}</span>
    ),
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
    accessorKey: "pr",
    header: ({ column }) => <SortableHeader column={column}>PR</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-xs font-mono">{row.original.pr}</span>
    ),
  },
  {
    accessorKey: "porPr",
    header: ({ column }) => (
      <SortableHeader column={column}>Por PR</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono text-right">{row.original.porPr}</span>
    ),
    size: 100,
  },
  {
    accessorKey: "diferencia",
    header: ({ column }) => (
      <SortableHeader column={column}>Diferencia</SortableHeader>
    ),
    cell: ({ row }) => {
      const diff =
        Number(row.original.solicito ?? 0) -
        Number(row.original.porPr ?? 0);
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
    accessorKey: "injerto",
    header: ({ column }) => (
      <SortableHeader column={column}>Injerto</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {row.original.injerto}
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
            {targetDate}
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
    { accessorKey: "injerto", exportHeader: "Injerto", pdfWidth: "8%" },
    { accessorKey: "semSiembra", exportHeader: "Sem Siembra", pdfWidth: "10%" },
    {
      accessorKey: "fechaSugeridaSiembra",
      exportHeader: "Fecha Sug. Siembra",
      pdfWidth: "12%",
    },
    { accessorKey: "semEntrega", exportHeader: "Sem Entrega", pdfWidth: "12%" },
    { accessorKey: "estado", exportHeader: "Estado", pdfWidth: "8%" },
  ];

export const faltaGerminacionExportColumns: ExportColumn<FaltaGerminacionDto>[] =
  [
    { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "10%" },
    { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "12%" },
    { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "18%" },
    { accessorKey: "injerto", exportHeader: "Injerto", pdfWidth: "10%" },
    { accessorKey: "fPrimer", exportHeader: "Fecha Primer", pdfWidth: "15%" },
    { accessorKey: "pr", exportHeader: "PR", pdfWidth: "10%" },
  ];

export const faltantePlantasExportColumns: ExportColumn<FaltantePlantasDto>[] =
  [
    { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "8%" },
    { accessorKey: "hai", exportHeader: "HAI", pdfWidth: "6%" },
    { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "10%" },
    { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "15%" },
    { accessorKey: "solicito", exportHeader: "Solicitadas", pdfWidth: "10%" },
    { accessorKey: "pr", exportHeader: "PR", pdfWidth: "10%" },
    { accessorKey: "porPr", exportHeader: "Por PR", pdfWidth: "10%" },
  ];

export const faltaPreExpedicionExportColumns: ExportColumn<FaltaPreExpedicionDto>[] =
  [
    { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "10%" },
    { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "12%" },
    { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "18%" },
    { accessorKey: "injerto", exportHeader: "Injerto", pdfWidth: "10%" },
    { accessorKey: "fPreexp", exportHeader: "Fecha Pre-Exp", pdfWidth: "15%" },
    { accessorKey: "pe", exportHeader: "PE", pdfWidth: "10%" },
  ];
