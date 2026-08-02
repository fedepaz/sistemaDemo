// apps/frontend/src/features/users/hooks/useRegister.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthResponseDto, RegisterAuthDto } from "@vivero/shared";
import { toast } from "sonner";
import { userService } from "../api/userService";
import { invalidateQueries } from "@/lib/query-invalidation-map";

/**
 * Hook for administrative user registration.
 * Unlike public registration, this does NOT automatically sign in the newly created user.
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponseDto, Error, RegisterAuthDto>({
    mutationFn: userService.register,
    onSuccess: () => {
      toast.success("Usuario creado exitosamente", {
        duration: 3000,
      });
      invalidateQueries(queryClient, "register");
    },
  });
};
