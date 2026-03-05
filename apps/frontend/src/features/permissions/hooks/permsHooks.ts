// src/features/permissions/hooks/permsHooks.ts

import { clientFetch } from "@/lib/api/client-fetch";
import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { UserPermissions } from "@vivero/shared";
import { toast } from "sonner";

export const permissionsQueryKeys = {
  tables: () => ["permissions", "tables"] as const,
  byUserId: (userId: string) => ["permissions", "user", userId] as const,
};

export const useTables = () => {
  return useSuspenseQuery<string[]>({
    queryKey: permissionsQueryKeys.tables(),
    queryFn: () =>
      clientFetch<string[]>("permissions/tables", { method: "GET" }),

    retry: 1, // Retry once to account for transient network issues
  });
};

export const useUserPermissions = (userId: string) => {
  return useSuspenseQuery<UserPermissions>({
    queryKey: permissionsQueryKeys.byUserId(userId),
    queryFn: () =>
      clientFetch<UserPermissions>(`permissions/user/${userId}`, {
        method: "GET",
      }),

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
    mutationFn: async ({ userId, permissions }) => {
      return clientFetch<void>(`permissions/user/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ permissions }),
      });
    },
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
