// src/features/auth/hooks/useChangePassword.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { ChangePasswordDto } from "@vivero/shared";
import { toast } from "sonner";
import { authService } from "../api/authService";

export const useChangePassword = () => {
  const mutation = useMutation<void, Error, ChangePasswordDto>({
    mutationFn: authService.changePassword,
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
