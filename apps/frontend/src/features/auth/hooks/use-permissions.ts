// apps/frontend/src/features/auth/hooks/use-permissions.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { UserPermissions } from "@vivero/shared";
import { clientFetch } from "@/lib/api/client-fetch";

export const permissionsQueryKeys = {
  all: ["permissions"] as const,
  me: () => [...permissionsQueryKeys.all, "me"] as const,
};

export const usePermissions = () => {
  const { isSignedIn } = useAuth();

  return useQuery<UserPermissions>({
    queryKey: permissionsQueryKeys.me(),
    queryFn: () =>
      clientFetch<UserPermissions>("permissions/me", {
        method: "GET",
      }),
    enabled: isSignedIn,
    retry: 1, // Retry once to account for transient network issues
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
