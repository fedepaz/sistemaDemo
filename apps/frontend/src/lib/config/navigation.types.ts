// src/lib/config/navigation.types.ts

type IconComponent = React.ComponentType<{ className?: string }>;

export interface NavigationItem {
  title: string;
  href: string;
  icon: IconComponent;
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

export interface NavigationSubGroup {
  kind: "subGroup";
  id: string;
  title: string;
  icon: IconComponent;
  items: NavigationItem[];
}

export interface NavigationStandalone {
  kind: "standalone";
  title: string;
  href: string;
  icon: IconComponent;
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
  kind: "group";
  id: string;
  title: string;
  icon: IconComponent;
  items: NavigationItem[];
}

export interface NavigationNestedGroup {
  kind: "nestedGroup";
  id: string;
  title: string;
  icon: IconComponent;
  items: (NavigationSubGroup | NavigationItem)[];
}

export type NavigationConfigEntry =
  | NavigationStandalone
  | NavigationGroup
  | NavigationNestedGroup;

export type NavigationConfig = NavigationConfigEntry[];
