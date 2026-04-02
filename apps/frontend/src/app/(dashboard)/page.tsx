// src/app/(dashboard)/page.tsx

import { RootDashboard } from "@/features/dashboard";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <RootDashboard />;
}
