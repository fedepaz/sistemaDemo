// src/features/permissions/hooks/permsHooks.ts

import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Entity, UserEntityPermission, UserPermissions } from "@vivero/shared";
import { toast } from "sonner";
import { permissionService } from "../api/permissionService";
import { adminPermissionsQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";

export const useTables = () => {
  return useSuspenseQuery<Entity[]>({
    queryKey: adminPermissionsQueryKeys.tables(),
    queryFn: permissionService.fetchTables,
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useTableByName = (tableName: string) => {
  return useSuspenseQuery<Entity>({
    queryKey: adminPermissionsQueryKeys.table(tableName),
    queryFn: () => permissionService.fetchTableByName(tableName),
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useUserPermissions = (userId: string) => {
  return useSuspenseQuery<UserPermissions>({
    queryKey: adminPermissionsQueryKeys.byUserId(userId),
    queryFn: () => permissionService.fetchUserPermissions(userId),
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useEntityPermissions = (entityId: string) => {
  return useSuspenseQuery<UserEntityPermission[]>({
    queryKey: adminPermissionsQueryKeys.byEntityId(entityId),
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
      invalidateQueries(queryClient, "setUserPermissions", data);
    },
  });
};
