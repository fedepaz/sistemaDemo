// src/lib/config/navigation.types.ts

export interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType;
  description?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  dashboard?: {
    statsLabel: string;
  };
  requiredPermission?: {
    table: string;
    action: "read";
  };
}

export interface NavigationGroup {
  id: string;
  title: string;
  icon: React.ComponentType;
  items: NavigationItem[];
}
