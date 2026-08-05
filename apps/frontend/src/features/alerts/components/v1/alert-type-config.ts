import type React from "react";
import {
  AlertTriangle,
  FlaskConical,
  Sprout,
  Truck,
  Calendar,
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
  borderColor: string;
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
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
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
    icon: FlaskConical,
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/20",
    label: "Falta Recuento Germinación",
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
    icon: Sprout,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    label: "Faltante Estimado de Plantas",
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
    icon: Truck,
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/20",
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
