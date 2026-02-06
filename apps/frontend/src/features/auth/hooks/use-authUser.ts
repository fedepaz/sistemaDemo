// apps/frontend/src/features/auth/hooks/use-authUser.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { UserProfileDto } from "@vivero/shared";
import { useAuth } from "./useAuth";
import { ApiError, clientFetch } from "@/lib/api/client-fetch";

// This is the key for the query cache
export const userProfileQueryKeys = {
  all: ["userProfile"] as const,
  me: () => [...userProfileQueryKeys.all, "me"] as const,
};

export const useAuthUserProfile = () => {
  const { isSignedIn, loading: authLoading } = useAuth();

  const query = useQuery<UserProfileDto>({
    queryKey: userProfileQueryKeys.me(),
    queryFn: () => clientFetch<UserProfileDto>("users/me", { method: "GET" }),
    enabled: isSignedIn,
    retry: 1, // Retry once to account for transient network issues
    throwOnError: false,
  });

  // Determine if the database is unavailable
  const isLoading = authLoading || query.isLoading;
  const isDatabaseUnavailable =
    query.isError &&
    !(
      query.error instanceof ApiError &&
      (query.error.status === 401 || query.error.status === 403)
    );
  const isPendingPermissions = isSignedIn && query.isSuccess && !query.data;

  return {
    userProfile: query.data,
    isLoading,
    isError: query.isError,
    isDatabaseUnavailable,
    isPendingPermissions,
  };
};
