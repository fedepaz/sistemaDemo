// src/components/common/dashboard-protected-layout.tsx
"use client";

import { useAuthUserProfileContext } from "@/features/auth/providers/AuthProvider";
import { LoadingSpinner } from "./loading-spinner";
import { DatabaseUnavailablePage } from "./database-unavailable";
import { PendingPermissionsPage } from "./pending-permissions";

interface DashboardProtectedLayoutProps {
  children: React.ReactNode;
}

export function DashboardProtectedLayout({
  children,
}: DashboardProtectedLayoutProps) {
  const {
    userProfile,
    isLoading,
    isDatabaseUnavailable,
    isPendingPermissions,
  } = useAuthUserProfileContext();
  // 1. Unified Loading State (includes Clerk's loading and backend data fetching)
  // If isLoading is true, it means either Clerk is still loading, or the backend fetch is in progress.
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 2. Handle cases where the query returned an error indicating database unavailability
  if (isDatabaseUnavailable) {
    return <DatabaseUnavailablePage />;
  }

  // 3. Handle pending permissions scenario
  // This state implies the user is authenticated (as per useUserProfile's internal logic)
  // but their profile data suggests they are awaiting permissions.
  if (isPendingPermissions) {
    return <PendingPermissionsPage />;
  }

  // 4. User is signed in, profile fetched, and has permissions

  if (userProfile) {
    return <>{children}</>;
  }

  // Generic catch-all for any other unforeseen state
  return <LoadingSpinner />;
}
