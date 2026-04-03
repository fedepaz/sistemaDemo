// src/app/(dashboard)/permissions/page.tsx

import { PermissionsDashboard } from "@/features/permissions";

export const dynamic = "force-dynamic";

export default function PermissionsPage() {
  return <PermissionsDashboard />;
}
