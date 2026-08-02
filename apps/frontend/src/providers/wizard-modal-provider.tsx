"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type {
  WizardModalContextType,
  WizardModalState,
  WizardConfig,
} from "./wizard-modal-types";

const initialState: WizardModalState = {
  isOpen: false,
  config: null,
  currentStep: 0,
  formData: {},
};

const WizardModalContext = createContext<WizardModalContextType | undefined>(
  undefined
);

export function WizardModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardModalState>(initialState);

  const openWizard = useCallback((config: WizardConfig) => {
    setState({
      isOpen: true,
      config,
      currentStep: 0,
      formData: config.initialData as Record<string, unknown> ?? {},
    });
  }, []);

  const closeWizard = useCallback(() => {
    setState(initialState);
  }, []);

  const nextStep = useCallback((stepData: unknown) => {
    setState((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
      formData: { ...prev.formData, ...(stepData as Record<string, unknown>) },
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  return (
    <WizardModalContext.Provider
      value={{ openWizard, closeWizard, nextStep, prevStep, state }}
    >
      {children}
      <Dialog open={state.isOpen} onOpenChange={(open) => { if (!open) closeWizard(); }}>
        <DialogContent>
          <p>WizardModal placeholder — implement steps when ready</p>
        </DialogContent>
      </Dialog>
    </WizardModalContext.Provider>
  );
}

export function useWizard(): WizardModalContextType {
  const context = useContext(WizardModalContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardModalProvider");
  }
  return context;
}
