// apps/frontend/src/features/auth/api/authService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { 
  AuthResponseDto, 
  ChangePasswordDto, 
  LoginAuthDto, 
  UserPermissions, 
  UserProfileDto 
} from "@vivero/shared";

export const authService = {
  login: (credentials: LoginAuthDto) => {
    return clientFetch<AuthResponseDto>("auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout: () => {
    return clientFetch<void>("auth/logout", {
      method: "POST",
    });
  },

  changePassword: (data: ChangePasswordDto) => {
    return clientFetch<void>(`auth/password`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  getProfileMe: () => {
    return clientFetch<UserProfileDto>("users/me", { 
      method: "GET" 
    });
  },

  getPermissionsMe: () => {
    return clientFetch<UserPermissions>("permissions/me", {
      method: "GET",
    });
  },
};
