"use client";

import type { ComponentType } from "react";

export interface WizardStep {
  id: string;
  label: string;
  component: ComponentType;
}

export interface WizardConfig {
  title: string;
  steps: WizardStep[];
  onComplete: (data: unknown) => Promise<void>;
  initialData?: unknown;
}

export interface WizardModalState {
  isOpen: boolean;
  config: WizardConfig | null;
  currentStep: number;
  formData: Record<string, unknown>;
}

export interface WizardModalContextType {
  openWizard: (config: WizardConfig) => void;
  closeWizard: () => void;
  nextStep: (stepData: unknown) => void;
  prevStep: () => void;
  state: WizardModalState;
}
