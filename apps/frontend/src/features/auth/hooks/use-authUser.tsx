// apps/frontend/src/features/auth/hooks/use-authUser.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { backendFetch } from "@/lib/api/backend";
import { useUser } from "@clerk/nextjs";
import { UserProfileDto } from "@vivero/shared";

// This is the key for the query cache
export const userProfileQueryKeys = {
  all: ["userProfile"] as const,
  me: () => [...userProfileQueryKeys.all, "me"] as const,
};

export const useAuthUserProfile = () => {
  const { isLoaded, isSignedIn } = useUser();

  const {
    data: userProfile,
    isLoading,
    isError,
    isSuccess,
    ...rest
  } = useQuery<UserProfileDto>({
    queryKey: userProfileQueryKeys.me(),
    queryFn: () => backendFetch<UserProfileDto>("users/me", { method: "GET" }),
    enabled: isLoaded && isSignedIn,
    retry: 1, // Retry once to account for transient network issues
  });

  // Determine if the database is unavailable
  const isDatabaseUnavailable = isError;

  // Determine if permissions are pending: user is signed in, query was successful, but no userProfile is returned.
  // This assumes the backend returns null/undefined userProfile for pending permissions when signed in.
  const isPendingPermissions =
    isLoaded && isSignedIn && isSuccess && !userProfile;

  if (userProfile) {
    console.log("userProfile", userProfile);
  }

  return {
    userProfile,
    isLoading,
    isError,
    isDatabaseUnavailable,
    isPendingPermissions,
    ...rest,
  };
};
