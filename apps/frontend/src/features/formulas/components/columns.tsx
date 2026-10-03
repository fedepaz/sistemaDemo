// apps/frontend/src/features/formulas/components/columns.tsx
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { FormulaDto } from "@vivero/shared";
import { SortableHeader } from "@/components/data-display/data-table";
import { formatShortDate } from "@/lib/date-utils";
import { ExportColumn } from "@/lib/export";
import { AlertTriangle } from "lucide-react";

interface CellProps {
  row?: Row<FormulaDto>;
  table?: Table<FormulaDto>;
}

function ProductoCell({
  row,
  field,
  inactiveIds,
}: CellProps & { field: string; inactiveIds: Set<string> }) {
  if (!row) return null;
  const value = row.original[field as keyof FormulaDto];
  const idField = field.replace("Nombre", "Id") as keyof FormulaDto;
  const productoId = row.original[idField];
  const marked = typeof productoId === "string" && inactiveIds.has(productoId);
  return (
    <span className="font-black text-sm text-foreground tracking-tight uppercase truncate">
      {value ? (
        <span className="inline-flex items-center gap-1">
          {String(value)}
          {marked && (
            <span
              role="img"
              aria-label="Producto eliminado"
              title="Producto eliminado"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            </span>
          )}
        </span>
      ) : (
        <span className="text-muted-foreground/40">-</span>
      )}
    </span>
  );
}

function PorcentajeCell({ row, field }: CellProps & { field: string }) {
  if (!row) return null;
  const value = row.original[field as keyof FormulaDto];
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

export function createFormulaColumns(
  inactiveProductoIds: Set<string>,
): ColumnDef<FormulaDto>[] {
  return [
    {
      accessorKey: "producto1Nombre",
      header: ({ column }) => (
        <SortableHeader column={column}>Producto 1</SortableHeader>
      ),
      cell: ({ row }) => (
        <ProductoCell
          row={row}
          field="producto1Nombre"
          inactiveIds={inactiveProductoIds}
        />
      ),
    },
    {
      accessorKey: "porcentaje1",
      header: ({ column }) => (
        <SortableHeader column={column}>%1</SortableHeader>
      ),
      cell: ({ row }) => <PorcentajeCell row={row} field="porcentaje1" />,
    },
    {
      accessorKey: "producto2Nombre",
      header: ({ column }) => (
        <SortableHeader column={column}>Producto 2</SortableHeader>
      ),
      cell: ({ row }) => (
        <ProductoCell
          row={row}
          field="producto2Nombre"
          inactiveIds={inactiveProductoIds}
        />
      ),
    },
    {
      accessorKey: "porcentaje2",
      header: ({ column }) => (
        <SortableHeader column={column}>%2</SortableHeader>
      ),
      cell: ({ row }) => <PorcentajeCell row={row} field="porcentaje2" />,
    },
    {
      accessorKey: "producto3Nombre",
      header: ({ column }) => (
        <SortableHeader column={column}>Producto 3</SortableHeader>
      ),
      cell: ({ row }) => (
        <ProductoCell
          row={row}
          field="producto3Nombre"
          inactiveIds={inactiveProductoIds}
        />
      ),
    },
    {
      accessorKey: "porcentaje3",
      header: ({ column }) => (
        <SortableHeader column={column}>%3</SortableHeader>
      ),
      cell: ({ row }) => <PorcentajeCell row={row} field="porcentaje3" />,
    },
    {
      accessorKey: "producto4Nombre",
      header: ({ column }) => (
        <SortableHeader column={column}>Producto 4</SortableHeader>
      ),
      cell: ({ row }) => (
        <ProductoCell
          row={row}
          field="producto4Nombre"
          inactiveIds={inactiveProductoIds}
        />
      ),
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
}

// Static export kept for FormulasDashboard's columnCount (skeleton only).
export const formulaColumns = createFormulaColumns(new Set<string>());

export const formulaExportColumns: ExportColumn<FormulaDto>[] = [
  {
    accessorKey: "producto1Nombre",
    exportHeader: "Producto 1",
    exportValue: (_, row) => row.producto1Nombre || "",
    pdfWidth: "16%",
  },
  {
    accessorKey: "porcentaje1",
    exportHeader: "%1",
    exportValue: (value) => `${value}%`,
    pdfWidth: "6%",
  },
  {
    accessorKey: "producto2Nombre",
    exportHeader: "Producto 2",
    exportValue: (_, row) => row.producto2Nombre || "",
    pdfWidth: "16%",
  },
  {
    accessorKey: "porcentaje2",
    exportHeader: "%2",
    exportValue: (value) => (value != null ? `${value}%` : "-"),
    pdfWidth: "6%",
  },
  {
    accessorKey: "producto3Nombre",
    exportHeader: "Producto 3",
    exportValue: (_, row) => row.producto3Nombre || "",
    pdfWidth: "16%",
  },
  {
    accessorKey: "porcentaje3",
    exportHeader: "%3",
    exportValue: (value) => (value != null ? `${value}%` : "-"),
    pdfWidth: "6%",
  },
  {
    accessorKey: "producto4Nombre",
    exportHeader: "Producto 4",
    exportValue: (_, row) => row.producto4Nombre || "",
    pdfWidth: "16%",
  },
  {
    accessorKey: "porcentaje4",
    exportHeader: "%4",
    exportValue: (value) => (value != null ? `${value}%` : "-"),
    pdfWidth: "6%",
  },
  {
    accessorKey: "createdAt",
    exportHeader: "Creado",
    exportValue: (value) => new Date(value as Date).toLocaleDateString("es-AR"),
    pdfWidth: "12%",
  },
];
