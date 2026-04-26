// src/features/permissions/hooks/permsHooks.ts

import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Entity, UserEntityPermission, UserPermissions } from "@vivero/shared";
import { toast } from "sonner";
import { permissionService } from "../api/permissionService";

export const permissionsQueryKeys = {
  tables: () => ["permissions", "tables"] as const,
  table: (tableName: string) =>
    [...permissionsQueryKeys.tables(), tableName] as const,
  byUserId: (userId: string) => ["permissions", "user", userId] as const,
  byEntityId: (entityId: string) =>
    ["permissions", "entity", entityId] as const,
};

export const useTables = () => {
  return useSuspenseQuery<Entity[]>({
    queryKey: permissionsQueryKeys.tables(),
    queryFn: permissionService.fetchTables,
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useTableByName = (tableName: string) => {
  return useSuspenseQuery<Entity>({
    queryKey: permissionsQueryKeys.table(tableName),
    queryFn: () => permissionService.fetchTableByName(tableName),
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useUserPermissions = (userId: string) => {
  return useSuspenseQuery<UserPermissions>({
    queryKey: permissionsQueryKeys.byUserId(userId),
    queryFn: () => permissionService.fetchUserPermissions(userId),
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useEntityPermissions = (entityId: string) => {
  return useSuspenseQuery<UserEntityPermission[]>({
    queryKey: permissionsQueryKeys.byEntityId(entityId),
    queryFn: () => permissionService.fetchEntityPermissions(entityId),
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useSetUserPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    {
      userId: string;
      permissions: Array<{
        tableName: string;
        canCreate: boolean;
        canRead: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        scope: "NONE" | "OWN" | "ALL";
      }>;
    }
  >({
    mutationFn: permissionService.setUserPermissions,
    onSuccess: (_, data) => {
      const toastMessage = `Permisos de usuario actualizados exitosamente`;
      toast.success(toastMessage, {
        duration: 3000,
      });
      queryClient.invalidateQueries({
        queryKey: permissionsQueryKeys.byUserId(data.userId),
      });
      queryClient.invalidateQueries({
        queryKey: permissionsQueryKeys.tables(),
      });

      const authContext = queryClient.getQueryData(["userPermissions"]);
      if (authContext) {
        queryClient.setQueryData(["userPermissions"], data);
      }
    },
  });
};
