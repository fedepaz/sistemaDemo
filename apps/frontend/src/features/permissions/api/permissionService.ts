import { clientFetch } from "@/lib/api/client-fetch";
import { Entity, UserPermissions, UserEntityPermission } from "@vivero/shared";

export const permissionService = {
  fetchTables: () => {
    return clientFetch<Entity[]>("permissions/tables", { method: "GET" });
  },

  fetchTableByName: (tableName: string) => {
    return clientFetch<Entity>(`permissions/table/${tableName}`, {
      method: "GET",
    });
  },

  fetchUserPermissions: (userId: string) => {
    return clientFetch<UserPermissions>(`permissions/user/${userId}`, {
      method: "GET",
    });
  },

  fetchEntityPermissions: (entityId: string) => {
    return clientFetch<UserEntityPermission[]>(`permissions/entity/${entityId}`, {
      method: "GET",
    });
  },

  setUserPermissions: ({ userId, permissions }: {
    userId: string;
    permissions: Array<{
      tableName: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
      scope: "NONE" | "OWN" | "ALL";
    }>;
  }) => {
    return clientFetch<void>(`permissions/user/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ permissions }),
    });
  },
};
