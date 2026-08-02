"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type {
  AlertModalContextType,
  AlertModalState,
  AlertType,
} from "./alert-modal-types";

const initialState: AlertModalState = {
  isOpen: false,
  alertType: null,
};

const AlertModalContext = createContext<AlertModalContextType | undefined>(
  undefined
);

export function AlertModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AlertModalState>(initialState);

  const openAlert = useCallback(
    (alertType: AlertType, data?: unknown) => {
      setState({ isOpen: true, alertType, data });
    },
    []
  );

  const closeAlert = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <AlertModalContext.Provider value={{ openAlert, closeAlert, state }}>
      {children}
    </AlertModalContext.Provider>
  );
}

export function useAlertModal(): AlertModalContextType {
  const context = useContext(AlertModalContext);
  if (!context) {
    throw new Error("useAlertModal must be used within an AlertModalProvider");
  }
  return context;
}
