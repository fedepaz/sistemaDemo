// src/features/extendidos/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import { ExtendidoDto } from "@vivero/shared";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const partidaColumns: ColumnDef<ExtendidoDto>[] = [
  {
    accessorKey: "partidaId",
    header: ({ column }) => {
      return <SortableHeader column={column}>Partida</SortableHeader>;
    },
    size: 70,
  },
  {
    accessorKey: "nombreEspecie",
    header: ({ column }) => {
      return <SortableHeader column={column}>Producto</SortableHeader>;
    },
    cell: ({ row }) => (
      <TooltipProvider>
        <div className="flex flex-col py-0.5 max-w-[180px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-bold text-sm truncate leading-tight cursor-help">
                {row.original.codigoEspecie}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs font-semibold">
                Código: {row.original.codigoEspecie}
              </p>
            </TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-mono text-muted-foreground leading-none uppercase tracking-tighter truncate">
              {row.original.nombreEspecie}
            </span>
            {row.original.injerto && row.original.injerto !== "N" && (
              <Badge
                variant="outline"
                className="h-3.5 px-1 text-[8px] font-bold border-primary/20 text-primary bg-primary/5"
              >
                INJERTO: {row.original.injerto}
              </Badge>
            )}
          </div>
        </div>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "fechaSiembraReal",
    header: ({ column }) => {
      return <SortableHeader column={column}>Fechas</SortableHeader>;
    },
    cell: ({ row }) => {
      const today = new Date(2025, 6, 3);
      const year = today.getFullYear();
      const month =
        today.getMonth() > 9
          ? today.getMonth() + 1
          : `0${today.getMonth() + 1}`;
      const day = today.getDate() > 9 ? today.getDate() : `0${today.getDate()}`;
      const isToday =
        row.original.fechaEgresoCamara === `${year}-${month}-${day}`;

      return (
        <div className="flex flex-col py-0.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span
                className={
                  isToday
                    ? "text-[10px] font-bold uppercase tracking-tight text-primary"
                    : "text-[10px] font-bold uppercase leading-tight text-foreground"
                }
              >
                Extendido:
              </span>

              {isToday ? (
                <Badge
                  variant="destructive"
                  className="h-3.5 px-1 text-[8px] font-bold border-primary/20 text-primary bg-primary/5"
                >
                  Hoy
                </Badge>
              ) : null}
            </div>
            <span
              className={
                isToday
                  ? "text-xs font-black text-primary"
                  : "text-xs font-bold leading-tight text-foreground"
              }
            >
              {row.original.fechaEgresoCamara}
            </span>
          </div>
          <div className="flex flex-col mt-1 pt-1 border-t border-border/40">
            <span className="text-[9px] text-muted-foreground/80 leading-none uppercase font-medium">
              Siembra:
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {row.original.fechaSiembraReal}
            </span>
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
      const days = row.original.diasEnCamara;
      return (
        <Badge
          variant="outline"
          className="h-5 px-1.5 font-black border-primary/20 text-primary bg-primary/5 text-[10px]"
        >
          {days}
        </Badge>
      );
    },
  },
  {
    accessorKey: "stockInicial",
    header: ({ column }) => {
      return <SortableHeader column={column}>Stock</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex flex-col text-center">
        <span className="text-sm font-black text-primary leading-none">
          {row.original.stockInicial || 0}
        </span>
        <span className="text-[8px] uppercase font-bold text-primary/60 tracking-tighter mt-0.5">
          Inicial
        </span>
      </div>
    ),
  },
  {
    accessorKey: "nombreUbicacion",
    header: ({ column }) => {
      return <SortableHeader column={column}>Ubicación</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex flex-col py-0.5">
        <span
          className="text-xs font-bold leading-tight truncate max-w-[130px]"
          title={row.original.nombreUbicacion || "-"}
        >
          {row.original.nombreUbicacion || row.original.codigoUbicacion || "-"}
        </span>
        <span className="text-[9px] text-muted-foreground/80 leading-none mt-0.5 uppercase font-medium">
          Bandeja: {row.original.contenedor}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "codigoCamaraGerminacion",
    header: ({ column }) => {
      return <SortableHeader column={column}>Cámara</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex flex-col text-center">
        <span
          className="text-xs font-bold truncate max-w-[130px]"
          title="Cámara Germinación"
        >
          {row.original.codigoCamaraGerminacion || "-"}
        </span>
      </div>
    ),
  },
];
