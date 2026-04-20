// src/features/extendidos/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import { ExtendidoDto } from "@vivero/shared";
import { Badge } from "@/components/ui/badge";

export const partidaColumns: ColumnDef<ExtendidoDto>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return <SortableHeader column={column}>Partida</SortableHeader>;
    },
    size: 70,
  },
  {
    accessorKey: "productName",
    header: ({ column }) => {
      return <SortableHeader column={column}>Producto</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex flex-col py-0.5 max-w-[160px]">
        <span
          className="font-bold text-sm truncate leading-tight"
          title={row.original.productName}
        >
          {row.original.productName}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground leading-none mt-0.5 uppercase tracking-tighter">
          Cod: {row.original.productCode}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "actualSowingDate",
    header: ({ column }) => {
      return <SortableHeader column={column}>Cronología</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex flex-col py-0.5">
        <span className="text-xs font-bold leading-tight">
          R: {row.original.actualSowingDate}
        </span>
        <span className="text-[9px] text-muted-foreground/80 leading-none mt-0.5 italic">
          S: {row.original.suggestedSowingDate}
        </span>
      </div>
    ),
    size: 110,
  },
  {
    accessorKey: "daysInChamber",
    header: ({ column }) => {
      return <SortableHeader column={column}>Cámara</SortableHeader>;
    },
    cell: ({ row }) => {
      const days = row.original.daysInChamber;
      if (days === null)
        return <span className="text-muted-foreground/30 ml-2">-</span>;
      return (
        <Badge
          variant="outline"
          className="h-5 px-1.5 font-black border-primary/20 text-primary bg-primary/5 text-[10px]"
        >
          {days} días
        </Badge>
      );
    },
    size: 70,
  },
  {
    accessorKey: "traysSown",
    header: ({ column }) => {
      return <SortableHeader column={column}>Bandejas</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex flex-col text-center">
        <span className="text-xs font-black">{row.original.traysSown}</span>
        <span className="text-[8px] uppercase font-bold text-muted-foreground tracking-tighter">
          Sembr.
        </span>
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "traysExtended",
    header: ({ column }) => {
      return <SortableHeader column={column}>Ext.</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex flex-col text-center">
        <span className="text-sm font-black text-primary leading-none">
          {row.original.traysExtended}
        </span>
        <span className="text-[8px] uppercase font-bold text-primary/60 tracking-tighter mt-0.5">
          Extend.
        </span>
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "greenhouseCode",
    header: ({ column }) => {
      return <SortableHeader column={column}>Ubic.</SortableHeader>;
    },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <code className="bg-muted px-2 py-0.5 rounded-md text-[10px] font-black border border-border/40 shadow-sm">
          {row.original.greenhouseCode}
        </code>
      </div>
    ),
    size: 90,
  },
];
