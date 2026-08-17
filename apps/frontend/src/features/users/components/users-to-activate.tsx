// src/features/users/components/users-to-activate.tsx
"use client";

import { DataTable } from "@/components/data-display/data-table";
import { useUsersToActivate } from "../hooks/usersHooks";
import { userColumns } from "./columns";

export function UsersToActivate() {
  const { data: usersToActivate = [] } = useUsersToActivate();

  return (
    <DataTable
      columns={userColumns}
      data={usersToActivate}
      title="Usuarios pendientes de activación"
      description="Gestión a los usuarios que tienen una cuenta pero no han sido activadas."
      tableName="users"
      totalCount={usersToActivate.length}
    />
  );
}
