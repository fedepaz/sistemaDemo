import type React from "react";
import {
  Scissors,
  Sprout,
  AlertTriangle,
  Package,
  Calendar,
  Truck,
  Flag,
  Leaf,
  Hash,
  Percent,
} from "lucide-react";
import type { AlertType } from "@/features/alerts/types";

export interface AlertTypeConfig {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
  keyMetric?: {
    field: string;
    label: string;
    icon: React.ElementType;
  };
  fields: Array<{
    field: string;
    label: string;
    icon: React.ElementType;
  }>;
}

export const ALERT_TYPE_CONFIGS: Record<AlertType, AlertTypeConfig> = {
  SIEMBRA_RETRASADA: {
    icon: Scissors,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    label: "Siembra Retrasada",
    keyMetric: {
      field: "fechaSugeridaSiembra",
      label: "Fecha Sug.",
      icon: Calendar,
    },
    fields: [
      { field: "injerto", label: "Injerto", icon: Leaf },
      { field: "semSiembra", label: "Sem. Siembra", icon: Calendar },
      { field: "semEntrega", label: "Sem. Entrega", icon: Truck },
      { field: "estado", label: "Estado", icon: Flag },
    ],
  },
  FALTA_GERMINACION: {
    icon: Sprout,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    label: "Falta Germinación",
    keyMetric: {
      field: "fPrimer",
      label: "Fecha Primer",
      icon: Calendar,
    },
    fields: [
      { field: "injerto", label: "Injerto", icon: Leaf },
      { field: "pr", label: "PR", icon: Percent },
    ],
  },
  FALTANTE_PLANTAS: {
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Faltante Plantas",
    keyMetric: {
      field: "solicito",
      label: "Faltante",
      icon: AlertTriangle,
    },
    fields: [
      { field: "hai", label: "HAI", icon: Hash },
      { field: "fPrimer", label: "Fecha Primer", icon: Calendar },
      { field: "pr", label: "PR", icon: Percent },
      { field: "stIniPr", label: "ST", icon: Hash },
    ],
  },
  FALTA_PRE_EXPEDICION: {
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Falta Pre-Expedición",
    keyMetric: {
      field: "fPreexp",
      label: "Fecha Pre-Exp",
      icon: Calendar,
    },
    fields: [
      { field: "injerto", label: "Injerto", icon: Leaf },
      { field: "pe", label: "PE", icon: Hash },
    ],
  },
};
