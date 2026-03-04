// src/features/auth/hooks/useLogin.ts
"use client";

import { useMutation } from "@tanstack/react-query";

import { clientFetch } from "@/lib/api/client-fetch";
import { LoginAuthDto, AuthResponseDto } from "@vivero/shared";
import { useAuthContext } from "../providers/AuthProvider";
import { toast } from "sonner";

export const useLogin = () => {
  const { signIn } = useAuthContext();

  const mutation = useMutation<AuthResponseDto, Error, LoginAuthDto>({
    mutationFn: async (credentials) => {
      const response = await clientFetch<AuthResponseDto>("auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      console.log(response);
      return response;
    },
    onSuccess: (data) => {
      // Check if user is default password
      if (data.isDefaultPassword) {
        toast.success(
          "Contraseña por defecto, se abrirá un formulario para cambiar la contraseña",
          {
            duration: 3000,
          },
        );
      } else {
        const toastMessage = `Inicio de sesión exitoso como ${data.user.username}`;
        toast.success(toastMessage, {
          duration: 3000,
        });
        // Store refresh token
        localStorage.setItem("refreshToken", data.refreshToken);
        // Update auth state via useAuth
        signIn(data.accessToken, data.user);
      }
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};
