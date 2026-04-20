// src/features/extendidos/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import { ExtendidoDto } from "@vivero/shared";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex flex-col py-0.5 max-w-[180px]">
        <span
          className="font-bold text-sm truncate leading-tight"
          title={row.original.nombreEspecie}
        >
          {row.original.nombreEspecie}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-mono text-muted-foreground leading-none uppercase tracking-tighter">
            {row.original.codigoEspecie}
          </span>
          {row.original.injerto && row.original.injerto !== "N" && (
            <Badge variant="outline" className="h-3.5 px-1 text-[8px] font-bold border-orange-200 text-orange-600 bg-orange-50/50">
              INJERTO: {row.original.injerto}
            </Badge>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "fechaSiembraReal",
    header: ({ column }) => {
      return <SortableHeader column={column}>Fechas</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex flex-col py-0.5">
        <span className="text-xs font-bold leading-tight">
          S: {row.original.fechaSiembraReal}
        </span>
        <span className="text-[9px] text-muted-foreground/80 leading-none mt-0.5 italic">
          E: {row.original.fechaEgresoCamara}
        </span>
      </div>
    ),
    size: 110,
  },
  {
    accessorKey: "diasEnCamara",
    header: ({ column }) => {
      return <SortableHeader column={column}>Cámara</SortableHeader>;
    },
    cell: ({ row }) => {
      const days = row.original.diasEnCamara;
      return (
        <Badge
          variant="outline"
          className="h-5 px-1.5 font-black border-primary/20 text-primary bg-primary/5 text-[10px]"
        >
          {days} días
        </Badge>
      );
    },
    size: 80,
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
    size: 80,
  },
  {
    accessorKey: "nombreUbicacion",
    header: ({ column }) => {
      return <SortableHeader column={column}>Ubicación</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex flex-col py-0.5">
        <span className="text-xs font-bold leading-tight truncate max-w-[130px]" title={row.original.nombreUbicacion || '-'}>
          {row.original.nombreUbicacion || row.original.codigoUbicacion || '-'}
        </span>
        <span className="text-[9px] text-muted-foreground/80 leading-none mt-0.5 uppercase font-medium">
          Cont: {row.original.contenedor}
        </span>
      </div>
    ),
    size: 140,
  },
];
