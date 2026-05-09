// src/features/extendidos/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import { ExtendidoDto } from "@vivero/shared";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatShortDate } from "@/lib/date-utils";

export const partidaColumns: ColumnDef<ExtendidoDto>[] = [
  {
    accessorKey: "partidaId",
    header: ({ column }) => {
      return <SortableHeader column={column}>Partida</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="font-black text-sm text-primary/80 tracking-tight">
        #{row.original.partidaId}
      </div>
    ),
    size: 70,
  },
  {
    accessorKey: "nombreEspecie",
    header: ({ column }) => {
      return <SortableHeader column={column}>Nombre Producto</SortableHeader>;
    },
    cell: ({ row }) => (
      <TooltipProvider>
        <div className="flex flex-col py-1 max-w-[200px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 group cursor-help">
                <span className="font-bold text-sm truncate leading-tight group-hover:text-primary transition-colors">
                  {row.original.codigoEspecie}
                </span>
                {row.original.injerto && row.original.injerto !== "N" && (
                  <span className="text-[10px] font-black text-chart-2 uppercase">
                    ({row.original.injerto})
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-popover border-border shadow-xl"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-primary">
                  Detalle del Producto
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Código:{" "}
                  <span className="text-foreground font-mono">
                    {row.original.codigoEspecie}
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Especie:{" "}
                  <span className="text-foreground font-semibold">
                    {row.original.nombreEspecie}
                  </span>
                </p>
                {row.original.injerto && row.original.injerto !== "N" && (
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Injerto:{" "}
                    <span className="text-foreground font-semibold">
                      {row.original.injerto}
                    </span>
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
          <span className="text-[10px] font-medium text-muted-foreground/70 leading-none uppercase tracking-wider truncate mt-1">
            {row.original.nombreEspecie}
          </span>
        </div>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "codigoCamaraGerminacion",
    header: ({ column }) => {
      return <SortableHeader column={column}>Cámara No.</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex justify-center font-black text-xs text-chart-1">
        {row.original.codigoCamaraGerminacion}
      </div>
    ),
    size: 60,
  },
  {
    accessorKey: "fechaSugeridaSiembra",
    header: ({ column }) => {
      return <SortableHeader column={column}>Fecha Sugerida</SortableHeader>;
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
      return (
        <SortableHeader column={column}>Fecha Real Siembra</SortableHeader>
      );
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
      const dateStr = today.toISOString().split("T")[0];
      const isToday = row.original.fechaEgresoCamara === dateStr;

      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-foreground group">
            <span
              className={`text-xs font-black font-mono tracking-tighter ${isToday ? "text-primary" : ""}`}
            >
              {formatShortDate(row.original.fechaEgresoCamara)}
            </span>
          </div>
          {isToday && (
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </div>
          )}
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
  {
    accessorKey: "con",
    header: ({ column }) => {
      return <SortableHeader column={column}>Bandejas</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="flex flex-col items-center">
          <span className="text-primary font-black text-sm">
            {row.original.con}
          </span>
        </div>
      </div>
    ),
    size: 100,
  },
];
