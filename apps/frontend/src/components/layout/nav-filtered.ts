// src/components/layout/nav-filtered.ts

import type { UserPermissions } from "@vivero/shared";
import type { NavigationGroup } from "@/lib/config/navigation.types";

export function filterNavigation(
  config: NavigationGroup[],
  permissions: UserPermissions,
): NavigationGroup[] {
  return config
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.requiredPermission) return true;
        const perm = permissions[item.requiredPermission.table];
        return !!perm?.canRead;
      }),
    }))
    .filter((group) => group.items.length > 0);
}
