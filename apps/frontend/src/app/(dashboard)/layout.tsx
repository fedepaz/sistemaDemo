//src/app/[locale]/layout.tsx

import type React from "react";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/loading-spinner";

import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ReactClientProvider } from "@/providers/query-client-provider";
import ComingSoonPage from "@/components/common/coming-soon";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") {
    return <ComingSoonPage />;
  }

  return (
    <ReactClientProvider>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Protected routes (Dashboard Layout) 
            commented out for now, but can be enabled later
              <DashboardProtectedLayout>
                */}
        <div className="flex h-screen overflow-hidden">
          <DesktopSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-auto pb-16 md:pb-0">
              {children}
            </main>
          </div>
        </div>
        {/* </DashboardProtectedLayout> 
              </DashboardProtectedLayout>
                */}
      </Suspense>
    </ReactClientProvider>
  );
}
