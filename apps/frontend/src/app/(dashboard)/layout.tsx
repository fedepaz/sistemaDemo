//src/app/(dashboard)/layout.tsx

import type React from "react";
import { Suspense } from "react";

import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

import { DashboardProtectedLayout } from "@/components/common/dashboard-protected-layout";
import { RootDashboardSkeleton } from "@/features/dashboard";

export const dynamic = "force-dynamic";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <Suspense fallback={<RootDashboardSkeleton />}>
      <DashboardProtectedLayout>
        <div className="flex h-dvh overflow-hidden">
          <DesktopSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-auto pb-safe-area-inset-bottom md:pb-0 px-1 sm:px-2 lg:px-4 py-1.5">
              <div className="mx-auto w-full max-w-[1600px] space-y-4">
                {children}
              </div>
            </main>
          </div>
        </div>
      </DashboardProtectedLayout>
    </Suspense>
  );
}
