// apps/frontend/src/features/mezclas/components/columns.tsx
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { MezclaDto } from "@vivero/shared";
import { SortableHeader } from "@/components/data-display/data-table";
import { formatShortDate } from "@/lib/date-utils";
import { ExportColumn } from "@/lib/export";

interface CellProps {
  row?: Row<MezclaDto>;
  table?: Table<MezclaDto>;
}

function SustratoCell({ row, field }: CellProps & { field: string }) {
  if (!row) return null;
  const value = row.original[field as keyof MezclaDto];
  return (
    <span className="font-black text-sm text-foreground tracking-tight uppercase truncate">
      {value ? String(value) : <span className="text-muted-foreground/40">-</span>}
    </span>
  );
}

function PorcentajeCell({ row, field }: CellProps & { field: string }) {
  if (!row) return null;
  const value = row.original[field as keyof MezclaDto];
  return (
    <span className="text-xs font-bold font-mono tracking-tighter text-muted-foreground">
      {value != null ? `${value}%` : <span className="text-muted-foreground/40">-</span>}
    </span>
  );
}

function CreatedAtCell({ row }: CellProps) {
  if (!row) return null;
  return (
    <span className="text-xs font-bold font-mono tracking-tighter text-muted-foreground">
      {formatShortDate(row.original.createdAt)}
    </span>
  );
}

export const mezclaColumns: ColumnDef<MezclaDto>[] = [
  {
    accessorKey: "sustrato1Nombre",
    header: ({ column }) => (
      <SortableHeader column={column}>Sustrato 1</SortableHeader>
    ),
    cell: ({ row }) => <SustratoCell row={row} field="sustrato1Nombre" />,
  },
  {
    accessorKey: "porcentaje1",
    header: ({ column }) => (
      <SortableHeader column={column}>%1</SortableHeader>
    ),
    cell: ({ row }) => <PorcentajeCell row={row} field="porcentaje1" />,
  },
  {
    accessorKey: "sustrato2Nombre",
    header: ({ column }) => (
      <SortableHeader column={column}>Sustrato 2</SortableHeader>
    ),
    cell: ({ row }) => <SustratoCell row={row} field="sustrato2Nombre" />,
  },
  {
    accessorKey: "porcentaje2",
    header: ({ column }) => (
      <SortableHeader column={column}>%2</SortableHeader>
    ),
    cell: ({ row }) => <PorcentajeCell row={row} field="porcentaje2" />,
  },
  {
    accessorKey: "sustrato3Nombre",
    header: ({ column }) => (
      <SortableHeader column={column}>Sustrato 3</SortableHeader>
    ),
    cell: ({ row }) => <SustratoCell row={row} field="sustrato3Nombre" />,
  },
  {
    accessorKey: "porcentaje3",
    header: ({ column }) => (
      <SortableHeader column={column}>%3</SortableHeader>
    ),
    cell: ({ row }) => <PorcentajeCell row={row} field="porcentaje3" />,
  },
  {
    accessorKey: "sustrato4Nombre",
    header: ({ column }) => (
      <SortableHeader column={column}>Sustrato 4</SortableHeader>
    ),
    cell: ({ row }) => <SustratoCell row={row} field="sustrato4Nombre" />,
  },
  {
    accessorKey: "porcentaje4",
    header: ({ column }) => (
      <SortableHeader column={column}>%4</SortableHeader>
    ),
    cell: ({ row }) => <PorcentajeCell row={row} field="porcentaje4" />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader column={column}>Creado</SortableHeader>
    ),
    cell: ({ row }) => <CreatedAtCell row={row} />,
  },
];

export const mezclaExportColumns: ExportColumn<MezclaDto>[] = [
  {
    accessorKey: "sustrato1Nombre",
    exportHeader: "Sustrato 1",
    exportValue: (_, row) => row.sustrato1Nombre || "",
    pdfWidth: "15%",
  },
  {
    accessorKey: "porcentaje1",
    exportHeader: "% 1",
    exportValue: (value) => `${value}%`,
    pdfWidth: "8%",
  },
  {
    accessorKey: "sustrato2Nombre",
    exportHeader: "Sustrato 2",
    exportValue: (_, row) => row.sustrato2Nombre || "",
    pdfWidth: "15%",
  },
  {
    accessorKey: "porcentaje2",
    exportHeader: "% 2",
    exportValue: (value) => (value != null ? `${value}%` : "-"),
    pdfWidth: "8%",
  },
  {
    accessorKey: "sustrato3Nombre",
    exportHeader: "Sustrato 3",
    exportValue: (_, row) => row.sustrato3Nombre || "",
    pdfWidth: "15%",
  },
  {
    accessorKey: "porcentaje3",
    exportHeader: "% 3",
    exportValue: (value) => (value != null ? `${value}%` : "-"),
    pdfWidth: "8%",
  },
  {
    accessorKey: "sustrato4Nombre",
    exportHeader: "Sustrato 4",
    exportValue: (_, row) => row.sustrato4Nombre || "",
    pdfWidth: "15%",
  },
  {
    accessorKey: "porcentaje4",
    exportHeader: "% 4",
    exportValue: (value) => (value != null ? `${value}%` : "-"),
    pdfWidth: "8%",
  },
  {
    accessorKey: "createdAt",
    exportHeader: "Creado",
    exportValue: (value) => new Date(value as Date).toLocaleDateString("es-AR"),
    pdfWidth: "12%",
  },
];
