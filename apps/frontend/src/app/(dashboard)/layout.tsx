//src/app/(dashboard)/layout.tsx

import type React from "react";

import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

import { DashboardProtectedLayout } from "@/components/common/dashboard-protected-layout";
import { BillboardCheck } from "@/components/common/billboard-check";

export const dynamic = "force-dynamic";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <DashboardProtectedLayout>
      <div className="flex h-dvh overflow-hidden">
        <DesktopSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
            <main className="flex-1 overflow-auto pb-safe-area-inset-bottom px-3 xl:px-5 2xl:px-8 py-1.5">
            <div className="mx-auto w-full max-w-[1600px] space-y-2">
              <BillboardCheck />
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardProtectedLayout>
  );
}
