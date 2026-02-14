// src/features/users/hooks/useUsers.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UpdateUserProfileDto, UserProfileDto } from "@vivero/shared";
import { toast } from "sonner";

export const userProfileQueryKeys = {
  all: () => ["users"] as const,
  byUserName: (username: string) =>
    [...userProfileQueryKeys.all(), "byUserName", username] as const,
  byTenantId: (tenantId: string) =>
    [...userProfileQueryKeys.all(), "byTenantId", tenantId] as const,
  admin: () => ["users", "allAdmin"] as const,
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UserProfileDto,
    Error,
    { userUpdate: UpdateUserProfileDto }
  >({
    mutationFn: async ({ userUpdate }) => {
      return clientFetch<UserProfileDto>(`users/me`, {
        method: "PATCH",
        body: JSON.stringify(userUpdate),
      });
    },
    onSuccess: (data) => {
      console.log(data);
      const toastMessage = `Perfil de usuario ${data.username} actualizado exitosamente`;
      toast.success(toastMessage, {
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      const authContext = queryClient.getQueryData(["userProfile"]);
      if (authContext) {
        queryClient.setQueryData(["userProfile"], data);
      }
    },
  });
};

export const useUsers = () => {
  return useQuery<UserProfileDto[]>({
    queryKey: userProfileQueryKeys.all(),
    queryFn: () =>
      clientFetch<UserProfileDto[]>("users/all", { method: "GET" }),
    enabled: true,
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useUsersByUserName = (username: string) => {
  return useQuery<UserProfileDto | null>({
    queryKey: userProfileQueryKeys.byUserName(username),
    queryFn: () => {
      return clientFetch<UserProfileDto | null>(`users/username/${username}`, {
        method: "GET",
      });
    },
    enabled: !!username,
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useUsersByTenantId = (tenantId: string) => {
  return useQuery<UserProfileDto[]>({
    queryKey: userProfileQueryKeys.byTenantId(tenantId),
    queryFn: () => {
      return clientFetch<UserProfileDto[]>(`users/tenant/${tenantId}`, {
        method: "GET",
      });
    },
    enabled: !!tenantId,
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
    mutationFn: async ({ username, userUpdate }) => {
      return clientFetch<UserProfileDto>(`users/${username}`, {
        method: "PATCH",
        body: JSON.stringify(userUpdate),
      });
    },
    onSuccess: (data) => {
      const toastMessage = `Perfil de usuario ${data.username} actualizado exitosamente`;
      toast.success(toastMessage, {
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (username) => {
      await clientFetch(`users/${username}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      const toastMessage = `Usuario eliminado exitosamente`;
      toast.success(toastMessage, {
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useGetAllUsersAdmin = () => {
  return useQuery<UserProfileDto[]>({
    queryKey: userProfileQueryKeys.admin(),
    queryFn: () =>
      clientFetch<UserProfileDto[]>("users/allAdmin", { method: "GET" }),
    enabled: true,
    retry: 1, // Retry once to account for transient network issues
  });
};
