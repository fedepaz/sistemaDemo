// apps/frontend/src/features/auth/hooks/useLogout.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client-fetch";
import { useAuthContext } from "../providers/AuthProvider";
import { toast } from "sonner";

export const useLogout = () => {
  const { signOut } = useAuthContext();

  const mutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      // Call backend logout endpoint

      await clientFetch("auth/logout", {
        method: "POST",
      });
    },
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
