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

  const { userProfile, permissions } = useAuthContext();
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
        isCollapsed ? "w-16" : "w-60 mx-0.5",
      )}
    >
      {/* Header 
      <div className={`p-3 border-b flex items-center ${isCollapsed ? 'justify-center min-h-[65px]' : 'justify-between'}`}>
      */}
      <div className="p-3 border-b">
        <div
          className={`flex items-center ${isCollapsed ? "justify-center py-1" : "justify-between"}`}
        >
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center ">
                <span className="text-primary font-bold text-sm">DM</span>
              </div>
              <div>
                <h2 className="font-bold">Demo</h2>
                <p className="text-xs text-muted-foreground">
                  Sistema de gestión
                </p>
              </div>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 "
                aria-label={isCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="border border-border shadow-md">
              <p>{isCollapsed ? "Expandir" : "Contraer"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {visibleNavigation.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = expandedGroups.has(group.id);

          return (
            <div key={group.id}>
              {/* Group Header */}
              {!isCollapsed && (
                <Button
                  variant="ghost"
                  onClick={() => !isCollapsed && toggleGroup(group.id)}
                  className={cn(
                    "w-full justify-start gap-2 font-medium",
                    isCollapsed && "justify-center",
                  )}
                >
                  <GroupIcon className="h-5 w-5 shrink-0" />
                  <>
                    <span className="flex-1 text-left text-sm">
                      {group.title}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </>
                </Button>
              )}

              {/* Group Items */}
              {(isExpanded || isCollapsed) && (
                <div className={cn("space-y-1", !isCollapsed && "ml-3 mt-1")}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link key={item.href} href={item.href}>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "flex items-center space-x-3 p-2 rounded-lg transition-colors",
                                isActive
                                  ? "bg-primary/10 text-primary border border-primary/20"
                                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
                                isCollapsed && "justify-center",
                              )}
                              aria-label={item.title}
                            >
                              <div className="relative">
                                <Icon className="h-5 w-5" />
                                {item.badge && isCollapsed && (
                                  <Badge
                                    variant={item.badgeVariant || "secondary"}
                                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                                  >
                                    {item.badge.length > 2 ? "99+" : item.badge}
                                  </Badge>
                                )}
                              </div>
                              {!isCollapsed && (
                                <>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {item.title}
                                    </p>
                                    <p className="text-xs opacity-75">
                                      {item.description}
                                    </p>
                                  </div>
                                  {item.badge && (
                                    <Badge
                                      variant={item.badgeVariant || "secondary"}
                                      className="text-xs"
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
      {!isCollapsed && (
        <div className="p-3 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {userProfile?.firstName?.charAt(0)}
                {userProfile?.lastName?.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">
                {userProfile?.firstName + " " + userProfile?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {userProfile?.username}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
