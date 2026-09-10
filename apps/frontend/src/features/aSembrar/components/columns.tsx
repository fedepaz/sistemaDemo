"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SiembraPartidaDto } from "@vivero/shared";
import { Badge } from "@/components/ui/badge";
import type { ExportColumn } from "@/lib/export/types";

export const aSembrarColumns: ColumnDef<SiembraPartidaDto>[] = [
  {
    accessorKey: "partidaId",
    header: "Partida",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <span className="font-mono text-xs font-bold">
          #{p.partidaId}
          {p.indice > 0 && (
            <span className="text-muted-foreground"> / {p.indice}</span>
          )}
        </span>
      );
    },
    size: 90,
  },
  {
    accessorKey: "codigoEspecie",
    header: "Código",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-bold uppercase">
        {row.original.codigoEspecie}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "nombreEspecie",
    header: "Especie",
    cell: ({ row }) => (
      <span className="text-xs">{row.original.nombreEspecie}</span>
    ),
    size: 150,
  },
  {
    accessorKey: "cantidaNroCont",
    header: "Cantidad",
    cell: ({ row }) => (
      <span className="text-xs font-medium">
        {row.original.cantidaNroCont ?? "-"}
      </span>
    ),
    size: 80,
  },
  {
    accessorKey: "fSiembra",
    header: "F. Siembra",
    cell: ({ row }) => (
      <span className="text-xs">
        {row.original.fSiembra
          ? new Date(row.original.fSiembra).toLocaleDateString("es-AR")
          : "-"}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "usuarioNombre",
    header: "Autorizado por",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px] font-bold">
        {row.original.usuarioNombre}
      </Badge>
    ),
    size: 120,
  },
];

export const aSembrarExportColumns: ExportColumn<SiembraPartidaDto>[] = [
  { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "8%" },
  { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "10%" },
  { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "15%" },
  { accessorKey: "cantidaNroCont", exportHeader: "Cantidad", pdfWidth: "10%" },
  { accessorKey: "fSiembra", exportHeader: "F. Siembra", pdfWidth: "12%" },
  { accessorKey: "usuarioNombre", exportHeader: "Autorizado por", pdfWidth: "15%" },
];