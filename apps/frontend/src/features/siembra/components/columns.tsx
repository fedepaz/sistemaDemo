// src/features/siembra/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import { SiembraDto } from "@vivero/shared";
import type { ExportColumn } from "@/lib/export/types";
import { formatShortDate, getLocalDateStr } from "@/lib/date-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
    accessorKey: "propiedad",
    header: ({ column }) => (
      <SortableHeader column={column}>Propiedad</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{row.original.propiedad}</span>
    ),
  },
  {
    accessorKey: "solicito",
    header: ({ column }) => (
      <SortableHeader column={column}>Solicitada</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{row.original.solicito}</span>
    ),
  },
  {
    accessorKey: "nrocont",
    header: ({ column }) => (
      <SortableHeader column={column}>Cantidad</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{row.original.nrocont}</span>
    ),
  },

  {
    accessorKey: "fechaSugeridaSiembra",
    header: ({ column }) => {
      return <SortableHeader column={column}>Siembra Sug.</SortableHeader>;
    },
    cell: ({ row }) => {
      const today = new Date();
      const todayStr = getLocalDateStr(today);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = getLocalDateStr(tomorrow);

      const targetDate = row.original.fechaSugeridaSiembra;
      const isToday = targetDate === todayStr;
      const isTomorrow = targetDate === tomorrowStr;
      const isPastDue = targetDate < todayStr;

      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono tabular-nums text-muted-foreground">
              {formatShortDate(targetDate)}
            </span>
            {(isToday || isTomorrow || isPastDue) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex h-2 w-2 cursor-help">
                    {isToday && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    )}
                    {isTomorrow && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    )}
                    {isPastDue && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    )}
                    <span
                      className={cn(
                        "relative inline-flex rounded-full h-2 w-2",
                        isToday ? "bg-primary" : "",
                        isPastDue ? "bg-warning" : "",
                      )}
                    ></span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>
                    {isToday
                      ? "Siembra sugerida hoy"
                      : isTomorrow
                        ? "Siembra sugerida mañana"
                        : "Siembra sugerida atrasada"}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "fechaSiembraReal",
    header: ({ column }) => {
      return <SortableHeader column={column}>Siembra Real.</SortableHeader>;
    },
    cell: ({ row }) => {
      const haveFechaSiembraReal =
        row.original.fechaSiembraReal === "0000-00-00"
          ? "-Sin Siembra-"
          : formatShortDate(row.original.fechaSiembraReal);
      return (
        <span className="text-sm font-semibold">{haveFechaSiembraReal}</span>
      );
    },
  },
];

export const partidaSiembraExportColumns: ExportColumn<SiembraDto>[] = [
  { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "8%" },
  { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "10%" },
  { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "15%" },
  { accessorKey: "propiedad", exportHeader: "Propiedad", pdfWidth: "10%" },
  { accessorKey: "solicito", exportHeader: "Solicitada", pdfWidth: "10%" },
  { accessorKey: "nrocont", exportHeader: "Cantidad", pdfWidth: "10%" },
  {
    accessorKey: "fechaSugeridaSiembra",
    exportHeader: "Siembra Sugerida",
    exportValue: (value) => formatShortDate(value as string),
    pdfWidth: "13%",
  },
];
