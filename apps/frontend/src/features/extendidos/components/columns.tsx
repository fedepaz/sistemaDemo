// src/features/extendidos/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import { ExtendidoDto } from "@vivero/shared";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatShortDate, getLocalDateStr } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { ExportColumn } from "@/lib/export/types";

export const partidaColumns: ColumnDef<ExtendidoDto>[] = [
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
    accessorKey: "codigoCamaraGerminacion",
    header: ({ column }) => {
      return <SortableHeader column={column}>Nª Cámara</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex justify-center font-black text-xs text-foreground">
        {row.original.codigoCamaraGerminacion}
      </div>
    ),
    size: 60,
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
  {
    accessorKey: "fechaEgresoCamara",
    header: ({ column }) => {
      return <SortableHeader column={column}>Fecha a Extender</SortableHeader>;
    },
    cell: ({ row }) => {
      const today = new Date();
      const todayStr = getLocalDateStr(today);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = getLocalDateStr(tomorrow);

      const targetDate = row.original.fechaEgresoCamara;
      const isToday = targetDate === todayStr;
      const isTomorrow = targetDate === tomorrowStr;

      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono tabular-nums text-muted-foreground">
              {formatShortDate(targetDate)}
            </span>
            {(isToday || isTomorrow) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex h-2 w-2 cursor-help">
                    {isToday && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    )}
                    <span
                      className={cn(
                        "relative inline-flex rounded-full h-2 w-2",
                        isToday ? "bg-warning" : "",
                      )}
                    ></span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{isToday ? "Egreso hoy" : "Egreso mañana"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "diasEnCamara",
    header: ({ column }) => {
      return <SortableHeader column={column}>Días</SortableHeader>;
    },
    cell: ({ row }) => {
      return (
        <div className="flex justify-center text-foreground/70 text-[10px] font-black">
          {row.original.diasEnCamara}
        </div>
      );
    },
    size: 80,
  },
];

export const partidaExportColumns: ExportColumn<ExtendidoDto>[] = [
  { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "8%" },
  { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "10%" },
  { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "15%" },
  { accessorKey: "nrocont", exportHeader: "Cantidad", pdfWidth: "10%" },

  {
    accessorKey: "codigoCamaraGerminacion",
    exportHeader: "Cámara",
    pdfWidth: "8%",
  },
  {
    accessorKey: "fechaSugeridaSiembra",
    exportHeader: "Siembra Sugerida",
    exportValue: (value) => formatShortDate(value as string),
    pdfWidth: "10%",
  },
  {
    accessorKey: "fechaSiembraReal",
    exportHeader: "Siembra Real",
    exportValue: (value) => formatShortDate(value as string),
    pdfWidth: "10%",
  },
  {
    accessorKey: "fechaEgresoCamara",
    exportHeader: "Fecha a Extender",
    exportValue: (value) => formatShortDate(value as string),
    pdfWidth: "10%",
  },
  {
    accessorKey: "diasEnCamara",
    exportHeader: "Días en Cámara",
    pdfWidth: "7%",
  },
];
