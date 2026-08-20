// src/components/common/dashboard-protected-layout.tsx
"use client";

import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { DatabaseUnavailablePage } from "./database-unavailable";
import { PendingPermissionsPage } from "./pending-permissions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RootDashboardSkeleton } from "@/features/dashboard";
import { AuthLayoutSkeleton } from "./skeleton/auth-layout-skeleton";
import { useHydration } from "@/hooks/useHydration";

interface DashboardProtectedLayoutProps {
  children: React.ReactNode;
}

export function DashboardProtectedLayout({
  children,
}: DashboardProtectedLayoutProps) {
  const router = useRouter();
  const mounted = useHydration();

  const {
    isSignedIn,
    loading: authLoading,
    userProfile,
    isLoading: profileLoading,
    isDatabaseUnavailable,
    isPendingPermissions,
  } = useAuthContext();

  useEffect(() => {
    if (mounted && !authLoading && !isSignedIn) {
      router.replace("/login");
    }
  }, [authLoading, isSignedIn, router, mounted]);

  if (!mounted || authLoading) {
    return <AuthLayoutSkeleton />;
  }

  if (!isSignedIn) {
    return <AuthLayoutSkeleton />;
  }

  if (profileLoading) {
    return <RootDashboardSkeleton />;
  }

  if (isDatabaseUnavailable) {
    return <DatabaseUnavailablePage />;
  }

  if (isPendingPermissions) {
    return <PendingPermissionsPage />;
  }

  if (!userProfile) {
    return <RootDashboardSkeleton />;
  }
  return <>{children}</>;
}
