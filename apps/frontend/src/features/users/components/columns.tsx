import { Row, Table, type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SortableHeader,
  StatusBadge,
} from "@/components/data-display/data-table";
import { User } from "../types";

interface CellProps {
  row?: Row<User>;
  table?: Table<User>;
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
  if (!row || !table) return null;
}

interface HeaderProps {
  column: ColumnDef<User>;
  translationKey: string;
}

function HeaderComponent({ column, translationKey }: HeaderProps) {
  return <SortableHeader column={column}>{translationKey}</SortableHeader>;
}

function CellBadgeRoleComponent({ row }: CellProps) {
  if (!row) return null;
  const role = row.getValue("role") as string;
  const roleText = role === "admin" ? "Administrador" : "Usuario";
  return (
    <StatusBadge status={role === "admin" ? "critical" : "info"}>
      {roleText}
    </StatusBadge>
  );
}

function CellBadgeStatusComponent({ row }: CellProps) {
  if (!row) return null;
  const status = row.getValue("status") as string;
  const statusText = status === "active" ? "Activo" : "Inactivo";
  return (
    <StatusBadge status={status === "active" ? "healthy" : "inactive"}>
      {statusText}
    </StatusBadge>
  );
}

export const userColumns: ColumnDef<User>[] = [
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
    accessorKey: "email",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Correo electrónico" />;
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Rol" />;
    },
    cell: ({ row }) => {
      return <CellBadgeRoleComponent row={row} />;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Estado" />;
    },
    cell: ({ row }) => {
      return <CellBadgeStatusComponent row={row} />;
    },
  },
  {
    accessorKey: "department",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Departamento" />;
    },
  },
  {
    accessorKey: "lastLogin",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Último inicio de sesión" />;
    },
  },
];
