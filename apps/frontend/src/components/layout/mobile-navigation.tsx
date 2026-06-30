// src/components/layout/mobile-navigation.tsx

"use client";

import { cn } from "@/lib/utils";
import { Menu, ChevronDown } from "lucide-react";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import Link from "next/link";
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
import { Logo } from "@/components/common/logo";
import { UserSidebarMenu } from "../user-profile/user-sidebar-menu";

function MobileNavItemLink({
  item,
  onNavigate,
}: {
  item: NavigationItem | NavigationStandalone;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link href={item.href} onClick={onNavigate}>
      <div
        className={cn(
          "flex items-center space-x-3 p-2 rounded-lg transition-colors agricultural-touch-target",
          isActive
            ? "bg-primary/10 text-primary border border-primary/20"
            : "hover:bg-muted text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon className="h-4.5 w-4.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[13px] truncate">{item.title}</p>
        </div>
        {"badge" in item && item.badge && (
          <Badge
            variant={item.badgeVariant || "secondary"}
            className="text-[9px] h-4 px-1"
          >
            {item.badge}
          </Badge>
        )}
      </div>
    </Link>
  );
}

function MobileGroupSection({
  group,
  expandedGroups,
  expandedSubGroups,
  toggleGroup,
  toggleSubGroup,
  onNavigate,
}: {
  group: NavigationGroup;
  expandedGroups: Set<string>;
  expandedSubGroups: Set<string>;
  toggleGroup: (id: string) => void;
  toggleSubGroup: (id: string) => void;
  onNavigate: () => void;
}) {
  const GroupIcon = group.icon;
  const isExpanded = expandedGroups.has(group.id);

  return (
    <div className="mb-1">
      <Button
        variant="ghost"
        onClick={() => toggleGroup(group.id)}
        className="w-full justify-start gap-2 font-bold text-[10px] uppercase tracking-widest text-muted-foreground/60 p-2 h-8"
      >
        <GroupIcon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{group.title}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            isExpanded && "rotate-180",
          )}
        />
      </Button>

      {isExpanded && (
        <div className="space-y-0.5 ml-2 mt-0.5">
          {group.items.map((item) => (
            <MobileNavItemLink
              key={item.href}
              item={item}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileNestedGroupSection({
  group,
  expandedGroups,
  expandedSubGroups,
  toggleGroup,
  toggleSubGroup,
  onNavigate,
}: {
  group: NavigationNestedGroup;
  expandedGroups: Set<string>;
  expandedSubGroups: Set<string>;
  toggleGroup: (id: string) => void;
  toggleSubGroup: (id: string) => void;
  onNavigate: () => void;
}) {
  const GroupIcon = group.icon;
  const isExpanded = expandedGroups.has(group.id);

  return (
    <div className="mb-1">
      <Button
        variant="ghost"
        onClick={() => toggleGroup(group.id)}
        className="w-full justify-start gap-2 font-bold text-[10px] uppercase tracking-widest text-muted-foreground/60 p-2 h-8"
      >
        <GroupIcon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{group.title}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            isExpanded && "rotate-180",
          )}
        />
      </Button>

      {isExpanded && (
        <div className="space-y-0.5 ml-2 mt-0.5">
          {group.items.map((item) => {
            if (isSubGroup(item)) {
              const isSubExpanded = expandedSubGroups.has(item.id);

              return (
                <div key={item.id} className="mb-0.5">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSubGroup(item.id)}
                    className="w-full justify-start gap-2 font-bold text-[10px] uppercase tracking-widest text-muted-foreground/60 p-2 h-7"
                  >
                    <span className="flex-1 text-left pl-3">{item.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        isSubExpanded && "rotate-180",
                      )}
                    />
                  </Button>
                  {isSubExpanded && (
                    <div className="space-y-0.5 ml-4 mt-0.5">
                      {item.items.map((subItem) => (
                        <MobileNavItemLink
                          key={subItem.href}
                          item={subItem}
                          onNavigate={onNavigate}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <MobileNavItemLink
                key={item.href}
                item={item}
                onNavigate={onNavigate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden agricultural-touch-target"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 h-dvh">
        <SheetHeader>
          <SheetTitle className="sr-only">Navegación móvil</SheetTitle>
          <SheetDescription className="sr-only">
            Menú de navegación lateral para dispositivos móviles
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b shrink-0">
            <Logo variant="icon" className="h-7 w-auto" />
          </div>

          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {visibleNavigation.map((entry) => {
              switch (entry.kind) {
                case "standalone":
                  return (
                    <MobileNavItemLink
                      key={entry.href}
                      item={entry}
                      onNavigate={() => setIsOpen(false)}
                    />
                  );

                case "group":
                  return (
                    <MobileGroupSection
                      key={entry.id}
                      group={entry}
                      expandedGroups={expandedGroups}
                      expandedSubGroups={expandedSubGroups}
                      toggleGroup={toggleGroup}
                      toggleSubGroup={toggleSubGroup}
                      onNavigate={() => setIsOpen(false)}
                    />
                  );

                case "nestedGroup":
                  return (
                    <MobileNestedGroupSection
                      key={entry.id}
                      group={entry}
                      expandedGroups={expandedGroups}
                      expandedSubGroups={expandedSubGroups}
                      toggleGroup={toggleGroup}
                      toggleSubGroup={toggleSubGroup}
                      onNavigate={() => setIsOpen(false)}
                    />
                  );

                default:
                  return null;
              }
            })}
          </nav>

          <div className="p-3 border-t shrink-0">
            <UserSidebarMenu />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
