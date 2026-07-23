"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SeverityLevel } from "./get-severity";

export interface AlertListItem {
  id: string;
  severity: SeverityLevel;
  type: "siembra" | "germinacion" | "faltante" | "pre-expedicion";
  partidaId: number;
  indice: number;
  codigoEspecie: string;
  nombreEspecie: string;
  statLine: string;
}

interface AlertListPanelProps {
  alerts: AlertListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const SEVERITY_ORDER: SeverityLevel[] = ["critical", "warning", "info"];

const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; icon: typeof AlertCircle; dotClass: string; bgClass: string }> = {
  critical: {
    label: "Críticas",
    icon: AlertCircle,
    dotClass: "bg-destructive",
    bgClass: "bg-destructive/5",
  },
  warning: {
    label: "Advertencias",
    icon: AlertTriangle,
    dotClass: "bg-warning",
    bgClass: "bg-warning/5",
  },
  info: {
    label: "Informativas",
    icon: Info,
    dotClass: "bg-info",
    bgClass: "bg-info/5",
  },
};

function AlertListGroup({
  severity,
  alerts,
  selectedId,
  onSelect,
}: {
  severity: SeverityLevel;
  alerts: AlertListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const config = SEVERITY_CONFIG[severity];

  if (alerts.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        <config.icon className="h-3.5 w-3.5" />
        {config.label}
        <span className="ml-auto text-[10px] font-mono font-extrabold bg-muted px-1.5 py-0.5 rounded-full">
          {alerts.length}
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-0.5 px-1">
          {alerts.map((alert) => {
            const isSelected = selectedId === alert.id;
            return (
              <button
                key={alert.id}
                onClick={() => onSelect(alert.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg transition-all cursor-pointer group border",
                  isSelected
                    ? "bg-accent border-accent shadow-sm"
                    : "border-transparent hover:bg-muted/50 hover:border-border/40",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span className={cn("mt-1 h-2 w-2 rounded-full shrink-0", config.dotClass)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs">{alert.codigoEspecie}</span>
                      <span className="text-[11px] font-semibold text-foreground truncate">
                        {alert.nombreEspecie}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      #{alert.partidaId}{alert.indice !== 0 && ` / ${alert.indice}`}
                    </p>
                    <p className="text-[10px] font-medium mt-0.5 text-muted-foreground/80">
                      {alert.statLine}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AlertListPanel({ alerts, selectedId, onSelect }: AlertListPanelProps) {
  return (
    <div className="space-y-1 overflow-y-auto">
      {SEVERITY_ORDER.map((severity) => (
        <AlertListGroup
          key={severity}
          severity={severity}
          alerts={alerts.filter((a) => a.severity === severity)}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
