"use client";

import type { AlertType } from "@/providers/alert-modal-types";

interface AlertModalContentProps {
  alertType: AlertType;
  data?: unknown;
}

export function AlertModalContent({ alertType, data: _data }: AlertModalContentProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        {alertType === "critical"
          ? "Alertas críticas requieren atención inmediata."
          : alertType === "warning"
          ? "Alertas pendientes de revisión."
          : "Alertas informativas."}
      </p>
    </div>
  );
}
