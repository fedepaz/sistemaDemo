// src/features/alerts/components/shared/filter-tabs.tsx
"use client";

import { AlertTriangle, FlaskConical, Sprout, Truck, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertTab = "all" | "siembra" | "germinacion" | "faltante" | "pre-expedicion";

interface FilterTabsProps {
  activeTab: AlertTab;
  onTabChange: (tab: AlertTab) => void;
  counts: {
    all: number;
    siembra: number;
    germinacion: number;
    faltante: number;
    preExpedicion: number;
  };
}

const TABS: {
  key: AlertTab;
  label: string;
  icon: typeof AlertTriangle;
  countKey: keyof FilterTabsProps["counts"];
  activeClass: string;
  hoverClass: string;
}[] = [
  {
    key: "all",
    label: "Todas",
    icon: LayoutGrid,
    countKey: "all",
    activeClass: "bg-primary text-primary-foreground border-primary shadow-sm",
    hoverClass: "hover:bg-muted hover:text-foreground",
  },
  {
    key: "siembra",
    label: "Siembra",
    icon: AlertTriangle,
    countKey: "siembra",
    activeClass: "bg-siembra text-siembra-foreground border-siembra shadow-sm",
    hoverClass: "hover:bg-siembra/10 hover:text-siembra hover:border-siembra/40",
  },
  {
    key: "germinacion",
    label: "Germinación",
    icon: FlaskConical,
    countKey: "germinacion",
    activeClass: "bg-germinacion text-germinacion-foreground border-germinacion shadow-sm",
    hoverClass: "hover:bg-germinacion/10 hover:text-germinacion hover:border-germinacion/40",
  },
  {
    key: "faltante",
    label: "Faltante",
    icon: Sprout,
    countKey: "faltante",
    activeClass: "bg-faltante text-faltante-foreground border-faltante shadow-sm",
    hoverClass: "hover:bg-faltante/10 hover:text-faltante hover:border-faltante/40",
  },
  {
    key: "pre-expedicion",
    label: "Pre-Exp",
    icon: Truck,
    countKey: "preExpedicion",
    activeClass: "bg-pre-expedicion text-pre-expedicion-foreground border-pre-expedicion shadow-sm",
    hoverClass: "hover:bg-pre-expedicion/10 hover:text-pre-expedicion hover:border-pre-expedicion/40",
  },
];

export function FilterTabs({ activeTab, onTabChange, counts }: FilterTabsProps) {
  return (
    <div
      className="flex flex-nowrap sm:flex-wrap gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide"
      role="tablist"
      aria-label="Filtrar alertas por tipo"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;
        const count = counts[tab.countKey];

        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "px-3 sm:px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border cursor-pointer whitespace-nowrap",
              isActive
                ? tab.activeClass
                : cn("bg-background border-border text-muted-foreground", tab.hoverClass)
            )}
          >
            <span
              className={cn(
                "min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11px] font-mono font-extrabold px-1",
                isActive
                  ? "bg-white/20 text-white"
                  : count > 0
                    ? "bg-muted text-muted-foreground"
                    : "bg-muted/50 text-muted-foreground/50"
              )}
            >
              {count}
            </span>
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
