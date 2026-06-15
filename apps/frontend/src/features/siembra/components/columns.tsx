// src/features/siembra/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import { SiembraDto } from "@vivero/shared";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatShortDate, getLocalDateStr } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export const partidaSiembraColumns: ColumnDef<SiembraDto>[] = [
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
    accessorKey: "nombreEspecie",
    header: ({ column }) => {
      return <SortableHeader column={column}>Nombre</SortableHeader>;
    },
    cell: ({ row }) => (
      <TooltipProvider>
        <div className="flex flex-col py-1 max-w-[200px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 group cursor-help">
                <span className="font-bold text-sm truncate leading-tight">
                  {row.original.codigoEspecie}
                </span>
                {row.original.injerto && row.original.injerto !== "N" && (
                  <span className="text-[10px] font-black text-muted-foreground uppercase">
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
                <p className="text-xs font-bold text-foreground">
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
    accessorKey: "contenedor",
    header: ({ column }) => {
      return (
        <SortableHeader column={column}>Tipo de Contenedor</SortableHeader>
      );
    },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="flex flex-col items-center">
          <span className="text-foreground font-black text-sm">
            {row.original.contenedor}
          </span>
        </div>
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "con",
    header: ({ column }) => {
      return <SortableHeader column={column}>Cantidad</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="flex flex-col items-center">
          <span className="text-foreground font-black text-sm">
            {row.original.con}
          </span>
        </div>
      </div>
    ),
    size: 100,
  },
];
