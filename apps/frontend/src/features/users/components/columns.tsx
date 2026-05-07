// src/features/users/components/columns.tsx

import { Row, Table, type ColumnDef } from "@tanstack/react-table";
import {
  SortableHeader,
  StatusBadge,
} from "@/components/data-display/data-table";
import { UserProfileDto } from "@vivero/shared";
import { Calendar } from "lucide-react";

interface CellProps {
  row?: Row<UserProfileDto>;
  table?: Table<UserProfileDto>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FullNameCell({ row }: { row: any }) {
  const user = row.original as UserProfileDto;
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return (
    <div className="font-black text-sm text-primary/80 tracking-tight">
      <span className="font-bold text-sm truncate leading-tight group-hover:text-primary transition-colors">
        {fullName || "No name"}
      </span>
    </div>
  );
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

function CreatedAtCell({ row }: CellProps) {
  if (!row) return null;
  const userCreatedAt = new Date(row.original.createdAt);

  return (
    <div className="flex items-center gap-2 text-muted-foreground group">
      <Calendar className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
      <span className="text-xs font-bold font-mono tracking-tighter">
        {userCreatedAt.toLocaleDateString()}
      </span>
    </div>
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
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-muted-foreground group">
        <span className="text-xs font-bold font-mono tracking-tighter">
          <CreatedAtCell row={row} />
        </span>
      </div>
    ),
  },
];
