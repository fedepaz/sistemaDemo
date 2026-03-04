// apps/frontend/src/features/users/hooks/useRegister.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client-fetch";
import { AuthResponseDto, RegisterAuthDto } from "@vivero/shared";
import { toast } from "sonner";

/**
 * Hook for administrative user registration.
 * Unlike public registration, this does NOT automatically sign in the newly created user.
 */
export const useRegister = () => {
  const mutation = useMutation<AuthResponseDto, Error, RegisterAuthDto>({
    mutationFn: async (userData) => {
      const response = await clientFetch<AuthResponseDto>("auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Usuario creado exitosamente", {
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear el usuario");
    },
  });

  return {
    register: mutation.mutate,
    registerAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};
