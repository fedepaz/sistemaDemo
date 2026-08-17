import { clientFetch } from "@/lib/api/client-fetch";
import {
  AuthResponseDto,
  RegisterAuthDto,
  RestorePasswordDto,
  UpdateUserProfileDto,
  UserProfileDto,
} from "@vivero/shared";

export const userService = {
  fetchAll: () => {
    return clientFetch<UserProfileDto[]>("users/all", { method: "GET" });
  },

  fetchByUserName: (username: string) => {
    return clientFetch<UserProfileDto | null>(`users/username/${username}`, {
      method: "GET",
    });
  },

  fetchByTenantId: (tenantId: string) => {
    return clientFetch<UserProfileDto[]>(`users/tenant/${tenantId}`, {
      method: "GET",
    });
  },

  fetchAllAdmin: () => {
    return clientFetch<UserProfileDto[]>("users/allAdmin", { method: "GET" });
  },

  fetchToActivate: () => {
    return clientFetch<UserProfileDto[]>("users/to-activate", {
      method: "GET",
    });
  },

  updateMe: (userUpdate: UpdateUserProfileDto) => {
    return clientFetch<UserProfileDto>(`users/me`, {
      method: "PATCH",
      body: JSON.stringify(userUpdate),
    });
  },

  updateUser: (username: string, userUpdate: UpdateUserProfileDto) => {
    return clientFetch<UserProfileDto>(`users/${username}`, {
      method: "PATCH",
      body: JSON.stringify(userUpdate),
    });
  },

  delete: (username: string) => {
    return clientFetch<void>(`users/${username}`, {
      method: "DELETE",
    });
  },

  register: (userData: RegisterAuthDto) => {
    return clientFetch<AuthResponseDto>("auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  restorePassword: (dto: RestorePasswordDto) => {
    return clientFetch<{ success: boolean; message: string }>("auth/restore", {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
  },
};
