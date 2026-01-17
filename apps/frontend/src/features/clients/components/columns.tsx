import { Row, Table, type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { SortableHeader } from "@/components/data-display/data-table";
import { Client } from "../types";
import { Badge } from "@/components/ui/badge";

interface CellProps {
  row?: Row<Client>;
  table?: Table<Client>;
}

function CellComponent({ row, table }: CellProps) {
  if (row) {
    return (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    );
  }
  if (table) {
    return (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    );
  }
  return null;
}

interface HeaderProps {
  column: ColumnDef<Client>;
  translationKey: string;
}

function HeaderComponent({ column, translationKey }: HeaderProps) {
  return <SortableHeader column={column}>{translationKey}</SortableHeader>;
}

function CellBadgeComponent({ row }: CellProps) {
  if (!row) return null;
  const status = row.getValue("status") as string;
  const variants: Record<string, "default" | "destructive" | "outline"> = {
    active: "default",
    inactive: "destructive",
    prospect: "outline",
  };
  const statusText =
    status === "active" ? "Activo" : status === "inactive" ? "Inactivo" : "Prospecto";
  return (
    <Badge variant={variants[status]} className="capitalize">
      {statusText}
    </Badge>
  );
}

export const clientColumns: ColumnDef<Client>[] = [
  {
    id: "select",
    header: ({ table }) => {
      return <CellComponent table={table} />;
    },
    cell: ({ row }) => {
      return <CellComponent row={row} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Nombre" />;
    },
  },
  {
    accessorKey: "contactPerson",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Persona de Contacto" />;
    },
  },

  {
    accessorKey: "email",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Correo Electrónico" />;
    },
    cell: ({ row }) => (
      <a
        href={`mailto:${row.getValue("email")}`}
        className="text-blue-600 hover:text-blue-900 transition-colors"
      >
        {row.getValue("email")}
      </a>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Teléfono" />;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Estado" />;
    },
    cell: ({ row }) => {
      return <CellBadgeComponent row={row} />;
    },
  },
  {
    accessorKey: "totalOrders",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Total de Pedidos" />;
    },
    cell: ({ row }) => `${row.getValue("totalOrders")}`,
  },
  {
    accessorKey: "totalRevenue",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Ingresos Totales" />;
    },
    cell: ({ row }) => `${row.getValue("totalRevenue")}`,
  },
  {
    accessorKey: "lastOrder",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Último Pedido" />;
    },
    cell: ({ row }) => `${row.getValue("lastOrder")}`,
  },
];
