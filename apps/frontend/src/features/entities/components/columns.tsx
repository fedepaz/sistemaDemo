// src/features/entities/components/columns.tsx

import { ColumnDef } from "@tanstack/react-table";
import { Entity } from "@vivero/shared";
import {
  SortableHeader,
  StatusBadge,
} from "@/components/data-display/data-table";

export const entityColumns: ColumnDef<Entity>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column}>Nombre</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "label",
    header: ({ column }) => (
      <SortableHeader column={column}>Etiqueta</SortableHeader>
    ),
    cell: ({ row }) => row.getValue("label"),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column}>Estado</SortableHeader>
    ),
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <StatusBadge status={isActive ? "healthy" : "inactive"}>
          {isActive ? "Activo" : "Inactivo"}
        </StatusBadge>
      );
    },
  },
  {
    accessorKey: "permissionType",
    header: ({ column }) => (
      <SortableHeader column={column}>Tipo de permiso</SortableHeader>
    ),
    cell: ({ row }) => {
      const type = row.getValue("permissionType") as string;
      const statusMap = {
        CRUD: "healthy",
        PROCESS: "info",
        READ_ONLY: "warning",
      } as const;

      return (
        <StatusBadge status={statusMap[type as keyof typeof statusMap]}>
          {type}
        </StatusBadge>
      );
    },
  },
];
