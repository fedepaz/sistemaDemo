// src/app/(dashboard)/permissions/page.tsx

import {
  PermissionsDashboard,
  PermissionsSkeleton,
} from "@/features/permissions";
import { Suspense } from "react";

export default function PermissionsPage() {
  return (
    <Suspense fallback={<PermissionsSkeleton />}>
      <PermissionsDashboard />
    </Suspense>
  );
}
