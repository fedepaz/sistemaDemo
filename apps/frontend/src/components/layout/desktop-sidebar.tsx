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
import { filterNavigation } from "./nav-filtered";
import type {
  NavigationStandalone,
  NavigationGroup,
  NavigationNestedGroup,
  NavigationItem,
  NavigationSubGroup,
} from "@/lib/config/navigation.types";

function isSubGroup(
  item: NavigationSubGroup | NavigationItem,
): item is NavigationSubGroup {
  return "kind" in item && item.kind === "subGroup";
}
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "@/components/common/logo";
import { UserSidebarMenu } from "../user-profile/user-sidebar-menu";

function NavItemLink({
  item,
  isCollapsed,
}: {
  item: NavigationItem | NavigationStandalone;
  isCollapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

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
              {"badge" in item && item.badge && isCollapsed && (
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
                {"badge" in item && item.badge && (
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
            {"description" in item && item.description && (
              <p className="text-[10px] opacity-80">{item.description}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </Link>
  );
}

function NavGroupSection({
  group,
  isCollapsed,
  expandedGroups,
  expandedSubGroups,
  toggleGroup,
  toggleSubGroup,
}: {
  group: NavigationGroup;
  isCollapsed: boolean;
  expandedGroups: Set<string>;
  expandedSubGroups: Set<string>;
  toggleGroup: (id: string) => void;
  toggleSubGroup: (id: string) => void;
}) {
  const GroupIcon = group.icon;
  const isExpanded = expandedGroups.has(group.id);

  return (
    <div className="mb-1">
      {!isCollapsed && (
        <Button
          variant="ghost"
          onClick={() => toggleGroup(group.id)}
          className="h-8 w-full justify-start gap-2 font-medium text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-foreground"
        >
          <GroupIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left">{group.title}</span>
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </Button>
      )}

      {(isExpanded || isCollapsed) && (
        <div className={cn("space-y-0.5", !isCollapsed && "ml-1 mt-0.5")}>
          {group.items.map((item) => (
            <NavItemLink
              key={item.href}
              item={item}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NavNestedGroupSection({
  group,
  isCollapsed,
  expandedGroups,
  expandedSubGroups,
  toggleGroup,
  toggleSubGroup,
}: {
  group: NavigationNestedGroup;
  isCollapsed: boolean;
  expandedGroups: Set<string>;
  expandedSubGroups: Set<string>;
  toggleGroup: (id: string) => void;
  toggleSubGroup: (id: string) => void;
}) {
  const GroupIcon = group.icon;
  const isExpanded = expandedGroups.has(group.id);

  return (
    <div className="mb-1">
      {!isCollapsed && (
        <Button
          variant="ghost"
          onClick={() => toggleGroup(group.id)}
          className="h-8 w-full justify-start gap-2 font-medium text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-foreground"
        >
          <GroupIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left">{group.title}</span>
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </Button>
      )}

      {(isExpanded || isCollapsed) && (
        <div className={cn("space-y-0.5", !isCollapsed && "ml-1 mt-0.5")}>
          {group.items.map((item) => {
            if (isSubGroup(item)) {
              const isSubExpanded = expandedSubGroups.has(item.id);
              const SubGroupIcon = item.icon;

              if (isCollapsed) {
                return (
                  <div key={item.id} className="space-y-0.5">
                    {item.items.map((subItem) => (
                      <NavItemLink
                        key={subItem.href}
                        item={subItem}
                        isCollapsed={isCollapsed}
                      />
                    ))}
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className="mb-0.5 bg-muted/90 rounded-md px-1 pb-0.5"
                >
                  <Button
                    variant="ghost"
                    onClick={() => toggleSubGroup(item.id)}
                    className="h-7 w-full justify-start gap-2 font-medium text-[10px] uppercase tracking-widest text-muted-foreground/50 hover:text-foreground"
                  >
                    <SubGroupIcon className="h-3 w-3 shrink-0" />
                    <span className="flex-1 text-left pl-4">{item.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform",
                        isSubExpanded && "rotate-180",
                      )}
                    />
                  </Button>
                  {isSubExpanded && (
                    <div className="space-y-0.5 ml-5 pb-0.5 bg-accent/40 rounded-md">
                      {item.items.map((subItem) => (
                        <NavItemLink
                          key={subItem.href}
                          item={subItem}
                          isCollapsed={isCollapsed}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavItemLink
                key={item.href}
                item={item}
                isCollapsed={isCollapsed}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DesktopSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { permissions } = useAuthContext();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["operations"]),
  );
  const [expandedSubGroups, setExpandedSubGroups] = useState<Set<string>>(
    new Set(),
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const toggleSubGroup = (subGroupId: string) => {
    setExpandedSubGroups((prev) => {
      const next = new Set(prev);
      if (next.has(subGroupId)) {
        next.delete(subGroupId);
      } else {
        next.add(subGroupId);
      }
      return next;
    });
  };

  const visibleNavigation = useMemo(
    () => filterNavigation(NAVIGATION_CONFIG, permissions),
    [permissions],
  );

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
            isCollapsed ? "justify-between pr-2.5" : "justify-between pl-1",
          )}
        >
          <Logo
            variant="icon"
            className={cn(
              "h-6 w-auto",
              isCollapsed ? "h-7 w-auto" : "h-6 w-auto",
            )}
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
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
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

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-1.5">
        {visibleNavigation.map((entry) => {
          switch (entry.kind) {
            case "standalone":
              return (
                <NavItemLink
                  key={entry.href}
                  item={entry}
                  isCollapsed={isCollapsed}
                />
              );

            case "group":
              return (
                <NavGroupSection
                  key={entry.id}
                  group={entry}
                  isCollapsed={isCollapsed}
                  expandedGroups={expandedGroups}
                  expandedSubGroups={expandedSubGroups}
                  toggleGroup={toggleGroup}
                  toggleSubGroup={toggleSubGroup}
                />
              );

            case "nestedGroup":
              return (
                <NavNestedGroupSection
                  key={entry.id}
                  group={entry}
                  isCollapsed={isCollapsed}
                  expandedGroups={expandedGroups}
                  expandedSubGroups={expandedSubGroups}
                  toggleGroup={toggleGroup}
                  toggleSubGroup={toggleSubGroup}
                />
              );

            default:
              return null;
          }
        })}
      </nav>

      <div className="p-2 border-t">
        <UserSidebarMenu isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}
