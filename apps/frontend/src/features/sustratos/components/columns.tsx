// apps/frontend/src/features/sustratos/components/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { SustratoDto } from "@vivero/shared";
import { SortableHeader } from "@/components/data-display/data-table";

export const sustratoColumns: ColumnDef<SustratoDto>[] = [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <SortableHeader column={column}>Nombre</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("nombre")}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader column={column}>Creado</SortableHeader>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString("es-AR");
    },
  },
];
