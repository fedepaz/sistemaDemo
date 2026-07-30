// src/components/layout/nav-filtered.ts

import type { UserPermissions } from "@vivero/shared";
import type {
  NavigationConfig,
  NavigationItem,
  NavigationSubGroup,
} from "@/lib/config/navigation.types";

function isSubGroup(
  item: NavigationSubGroup | NavigationItem,
): item is NavigationSubGroup {
  return "kind" in item && item.kind === "subGroup";
}

function hasReadPermission(
  item: NavigationItem,
  permissions: UserPermissions,
): boolean {
  if (!item.requiredPermission) return true;
  const perm = permissions[item.requiredPermission.table];
  return !!perm?.canRead;
}

function filterItems(
  items: NavigationItem[],
  permissions: UserPermissions,
): NavigationItem[] {
  return items.filter((item) => hasReadPermission(item, permissions));
}

function filterConfig(
  config: NavigationConfig,
  permissions: UserPermissions,
): NavigationConfig {
  return config
    .map((entry) => {
      switch (entry.kind) {
        case "standalone":
          return hasReadPermission(entry, permissions) ? entry : null;

        case "group": {
          const items = filterItems(entry.items, permissions);
          return items.length > 0 ? { ...entry, items } : null;
        }

        case "nestedGroup": {
          const items = entry.items
            .map((item) => {
              if (isSubGroup(item)) {
                const filtered = filterItems(item.items, permissions);
                return filtered.length > 0
                  ? { ...item, items: filtered }
                  : null;
              }
              return hasReadPermission(item, permissions) ? item : null;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
          return items.length > 0 ? { ...entry, items } : null;
        }

        default:
          return null;
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

export { filterConfig as filterNavigation };
