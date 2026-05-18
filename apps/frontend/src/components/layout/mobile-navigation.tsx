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
import { Logo } from "@/components/common/logo";
import { UserSidebarMenu } from "../user-profile/user-sidebar-menu";

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

interface NavigationGroup {
  id: string;
  title: string;
  icon: React.ElementType;
  items: NavigationItem[];
}

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
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
          {/* Header */}
          <div className="p-4 border-b shrink-0">
            <Logo variant="icon" className="h-7 w-auto" />
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {visibleNavigation.map((group) => {
              const GroupIcon = group.icon;
              const isExpanded = expandedGroups.has(group.id);

              return (
                <div key={group.id} className="mb-1">
                  {/* Group Header */}
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

                  {/* Group Items */}
                  {isExpanded && (
                    <div className="space-y-0.5 ml-2 mt-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                          >
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
                                <p className="font-medium text-[13px] truncate">
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
                            </div>
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
          <div className="p-3 border-t shrink-0">
            <UserSidebarMenu />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
