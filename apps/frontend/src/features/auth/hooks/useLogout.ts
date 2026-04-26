// apps/frontend/src/features/auth/hooks/useLogout.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthContext } from "../providers/AuthProvider";
import { toast } from "sonner";
import { authService } from "../api/authService";

export const useLogout = () => {
  const { signOut } = useAuthContext();

  const mutation = useMutation<void, Error, void>({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear refresh token
      localStorage.removeItem("refreshToken");
      toast.success("Sesión cerrada exitosamente", {
        duration: 3000,
      });

      signOut();
    },
  });

  return {
    logout: mutation.mutate,
    logoutAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};
