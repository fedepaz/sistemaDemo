// apps/frontend/src/features/sustratos/components/columns.tsx
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { SustratoDto } from "@vivero/shared";
import { SortableHeader } from "@/components/data-display/data-table";
import { formatShortDate } from "@/lib/date-utils";
import { ExportColumn } from "@/lib/export";

interface CellProps {
  row?: Row<SustratoDto>;
  table?: Table<SustratoDto>;
}

function CreatedAtCell({ row }: CellProps) {
  if (!row) return null;

  return (
    <span className="text-xs font-bold font-mono tracking-tighter text-muted-foreground">
      {formatShortDate(row.original.createdAt)}
    </span>
  );
}

export const sustratoColumns: ColumnDef<SustratoDto>[] = [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <SortableHeader column={column}>Nombre</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="font-black text-sm text-foreground tracking-tight">
        <span className="font-bold text-sm truncate leading-tight uppercase">
          {row.getValue("nombre")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader column={column}>Creado</SortableHeader>
    ),
    cell: ({ row }) => <CreatedAtCell row={row} />,
  },
];

export const sustratoExportColumns: ExportColumn<SustratoDto>[] = [
  {
    accessorKey: "nombre",
    exportHeader: "Nombre",
    exportValue: (_, row) => row.nombre || "",
    pdfWidth: "15%",
  },
  {
    accessorKey: "createdAt",
    exportHeader: "Creado",
    exportValue: (value) => new Date(value as Date).toLocaleDateString("es-AR"),
    pdfWidth: "20%",
  },
];
