// src/features/users/hooks/useUsers.ts

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  RestorePasswordDto,
  UpdateUserProfileDto,
  UserProfileDto,
} from "@vivero/shared";
import { userService } from "../api/userService";
import { usersQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";

export const useUsers = () => {
  return useSuspenseQuery<UserProfileDto[]>({
    queryKey: usersQueryKeys.all(),
    queryFn: userService.fetchAll,
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useUsersToActivate = () => {
  return useSuspenseQuery<UserProfileDto[]>({
    queryKey: usersQueryKeys.toActivate(),
    queryFn: userService.fetchToActivate,
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UserProfileDto,
    Error,
    { userUpdate: UpdateUserProfileDto }
  >({
    mutationFn: async ({ userUpdate }) => userService.updateMe(userUpdate),
    onSuccess: (data) => {
      const toastMessage = `Perfil de usuario ${data.username} actualizado exitosamente`;
      toast.success(toastMessage, {
        duration: 3000,
      });
      invalidateQueries(queryClient, "updateUserProfile");
      queryClient.setQueryData(usersQueryKeys.all(), data);
    },
  });
};

export const useUsersByUserName = (username: string) => {
  return useSuspenseQuery<UserProfileDto | null>({
    queryKey: usersQueryKeys.byUserName(username),
    queryFn: () => userService.fetchByUserName(username),
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useUsersByTenantId = (tenantId: string) => {
  return useSuspenseQuery<UserProfileDto[]>({
    queryKey: usersQueryKeys.byTenantId(tenantId),
    queryFn: () => userService.fetchByTenantId(tenantId),
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UserProfileDto,
    Error,
    { username: string; userUpdate: UpdateUserProfileDto }
  >({
    mutationFn: async ({ username, userUpdate }) =>
      userService.updateUser(username, userUpdate),
    onSuccess: (data) => {
      const toastMessage = `Perfil de usuario ${data.username} actualizado exitosamente`;
      toast.success(toastMessage, {
        duration: 3000,
      });
      invalidateQueries(queryClient, "updateUser");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: userService.delete,
    onSuccess: () => {
      const toastMessage = `Usuario eliminado exitosamente`;
      toast.success(toastMessage, {
        duration: 3000,
      });
      invalidateQueries(queryClient, "deleteUser");
    },
  });
};

export const useGetAllUsersAdmin = () => {
  return useSuspenseQuery<UserProfileDto[]>({
    queryKey: usersQueryKeys.admin(),
    queryFn: userService.fetchAllAdmin,
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useRestorePassword = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string },
    Error,
    RestorePasswordDto
  >({
    mutationFn: async (dto) => userService.restorePassword(dto),

    onSuccess: (data) => {
      const toastMessage =
        data.message ?? `Contraseña restaurada correctamente`;
      toast.success(toastMessage, {
        duration: 3000,
      });
      invalidateQueries(queryClient, "restorePassword");
    },
  });
};
