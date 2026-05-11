// src/features/users/components/columns.tsx

import { Row, Table, type ColumnDef } from "@tanstack/react-table";
import {
  SortableHeader,
} from "@/components/data-display/data-table";
import { UserProfileDto } from "@vivero/shared";
import { formatShortDate } from "@/lib/date-utils";

interface CellProps {
  row?: Row<UserProfileDto>;
  table?: Table<UserProfileDto>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FullNameCell({ row }: { row: any }) {
  const user = row.original as UserProfileDto;
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return (
    <div className="font-black text-sm text-foreground tracking-tight">
      <span className="font-bold text-sm truncate leading-tight">
        {fullName || "No name"}
      </span>
    </div>
  );
}

function StatusCell({ row }: CellProps) {
  if (!row) return null;
  const user = row.original as UserProfileDto;
  return (
    <span className="text-sm font-medium">
      {user.isActive ? "Activo" : "Inactivo"}
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
    cell: ({ row }) => (
      <span className="text-foreground font-semibold">
        {row.original.email}
      </span>
    ),
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
    cell: ({ row }) => <CreatedAtCell row={row} />,
  },
];
