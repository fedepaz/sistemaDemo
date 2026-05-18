// src/components/layout/desktop-sidebar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { NAVIGATION_CONFIG } from "@/lib/config/navigations";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "@/components/common/logo";
import { UserSidebarMenu } from "../user-profile/user-sidebar-menu";

interface NavigationItem {
  title: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  description?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

interface NavigationGroup {
  id: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  items: NavigationItem[];
}

export function DesktopSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const { permissions } = useAuthContext();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["operations"]),
  );

  const toggleGroup = (groupId: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupId)) {
      newExpandedGroups.delete(groupId);
    } else {
      newExpandedGroups.add(groupId);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const visibleNavigation: NavigationGroup[] = useMemo(() => {
    return NAVIGATION_CONFIG.map((group) => {
      const filteredItems = group.items.filter((item) => {
        if (!item.requiredPermission) return true;

        const { table } = item.requiredPermission;
        const perm = permissions[table];
        return !!perm?.canRead;
      });

      return {
        ...group,
        items: filteredItems,
      };
    }).filter((group) => group.items.length > 0);
  }, [permissions]);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-card border-r transition-all duration-300",
        isCollapsed ? "w-14" : "w-56",
      )}
    >
      <div className="p-2 border-b">
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "justify-between pl-1",
          )}
        >
          <Logo
            variant="icon"
            className={cn("h-6 w-auto", isCollapsed ? "h-7" : "h-6")}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-7 w-7"
                aria-label={
                  isCollapsed
                    ? "Expandir barra lateral"
                    : "Contraer barra lateral"
                }
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronLeft className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="border border-border shadow-md"
            >
              <p>{isCollapsed ? "Expandir" : "Contraer"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-1.5">
        {visibleNavigation.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = expandedGroups.has(group.id);

          return (
            <div key={group.id} className="mb-1">
              {/* Group Header */}
              {!isCollapsed && (
                <Button
                  variant="ghost"
                  onClick={() => !isCollapsed && toggleGroup(group.id)}
                  className={cn(
                    "h-8 w-full justify-start gap-2 font-medium text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-foreground",
                  )}
                >
                  <GroupIcon className="h-3.5 w-3.5 shrink-0" />
                  <>
                    <span className="flex-1 text-left">{group.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </>
                </Button>
              )}

              {/* Group Items */}
              {(isExpanded || isCollapsed) && (
                <div
                  className={cn("space-y-0.5", !isCollapsed && "ml-1 mt-0.5")}
                >
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link key={item.href} href={item.href}>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "flex items-center space-x-2.5 p-1.5 rounded-md transition-colors",
                                isActive
                                  ? "bg-primary/10 text-primary border border-primary/20"
                                  : "hover:bg-muted text-muted-foreground/80 hover:text-foreground",
                                isCollapsed && "justify-center",
                              )}
                              aria-label={item.title}
                            >
                              <div className="relative">
                                <Icon className="h-4 w-4" />
                                {item.badge && isCollapsed && (
                                  <Badge
                                    variant={item.badgeVariant || "secondary"}
                                    className="absolute -top-1 -right-1 h-3.5 w-3.5 p-0 flex items-center justify-center text-[8px]"
                                  >
                                    {item.badge.length > 2 ? "99+" : item.badge}
                                  </Badge>
                                )}
                              </div>
                              {!isCollapsed && (
                                <>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-[12px] truncate">
                                      {item.title}
                                    </p>
                                  </div>
                                  {item.badge && (
                                    <Badge
                                      variant={item.badgeVariant || "secondary"}
                                      className="text-[9px] h-4 px-1"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className={cn(
                              "border border-border shadow-md",
                              !isCollapsed && "hidden",
                            )}
                          >
                            <div className="flex flex-col gap-1">
                              <p className="font-semibold">{item.title}</p>
                              {item.description && (
                                <p className="text-[10px] opacity-80">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-2 border-t">
        <UserSidebarMenu isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}
