// src/features/users/components/columns.tsx

import { Row, Table, type ColumnDef } from "@tanstack/react-table";
import {
  SortableHeader,
  StatusBadge,
} from "@/components/data-display/data-table";
import { UserProfileDto } from "@vivero/shared";

interface CellProps {
  row?: Row<UserProfileDto>;
  table?: Table<UserProfileDto>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FullNameCell({ row }: { row: any }) {
  const user = row.original as UserProfileDto;
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return <span>{fullName || "No name"}</span>;
}

function StatusCell({ row }: CellProps) {
  if (!row) return null;
  const user = row.original as UserProfileDto;
  return (
    <StatusBadge status={user.isActive ? "healthy" : "inactive"}>
      {user.isActive ? "Activo" : "Inactivo"}
    </StatusBadge>
  );
}

export const userColumns: ColumnDef<UserProfileDto>[] = [
  {
    id: "fullName",
    header: ({ column }) => (
      <SortableHeader column={column}>Nombre completo</SortableHeader>
    ),
    cell: ({ row }) => {
      return <FullNameCell row={row} />;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <SortableHeader column={column}>Correo electrónico</SortableHeader>
    ),
    cell: ({ row }) => row.getValue("email"),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column}>Estado</SortableHeader>
    ),
    cell: ({ row }) => <StatusCell row={row} />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader column={column}>Creado</SortableHeader>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString();
    },
  },
];
