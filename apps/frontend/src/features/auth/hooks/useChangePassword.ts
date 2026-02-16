// src/features/auth/hooks/useChangePassword.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { ChangePasswordDto } from "@vivero/shared";
import { clientFetch } from "@/lib/api/client-fetch";
import { toast } from "sonner";

export const useChangePassword = () => {
  const mutation = useMutation<void, Error, ChangePasswordDto>({
    mutationFn: async (data) => {
      const response = await clientFetch<void>(`auth/password`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Contraseña actualizada correctamente", {
        duration: 3000,
      });
    },
  });

  return {
    changePasswordAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};
