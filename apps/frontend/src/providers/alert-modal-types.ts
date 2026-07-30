"use client";

export type AlertType = "critical" | "warning" | "info" | null;

export interface AlertModalState {
  isOpen: boolean;
  alertType: AlertType;
  data?: unknown;
}

export interface AlertModalContextType {
  openAlert: (alertType: AlertType, data?: unknown) => void;
  closeAlert: () => void;
  state: AlertModalState;
}
