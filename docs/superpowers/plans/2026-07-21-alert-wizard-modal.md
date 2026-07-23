# AlertModal & WizardModal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two reusable modal systems — AlertModal (functional) and WizardModal (stub) — with context+portal infrastructure mountable from anywhere in the app.

**Architecture:** Each modal gets its own React Context provider that holds open/close state and configuration. A portal renders the shadcn/ui Dialog at body level. `useAlertModal()` / `useWizard()` hooks are accessible from any component. Both providers mount in `AppProviders`.

**Tech Stack:** React 19, shadcn/ui Dialog, @radix-ui/react-dialog, testing-library/react, Jest 30

## Global Constraints

- All providers go in `src/providers/`
- `useAlertModal()` and `useWizard()` throw if called outside their provider
- shadcn/ui `Dialog` handles focus trap, Escape, backdrop click, ARIA labels
- `"use client"` directive on all provider and component files
- Follow existing patterns: `ErrorProvider` for context structure, `ThemeProvider` for test structure

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/providers/alert-modal-types.ts` | CREATE | `AlertType`, `AlertModalState`, `AlertModalContextType` types |
| `src/providers/alert-modal-provider.tsx` | CREATE | Context + Provider + portal + `useAlertModal()` hook |
| `src/providers/__tests__/alert-modal-provider.test.tsx` | CREATE | Tests for provider + hook |
| `src/components/modals/alert-modal-dialog.tsx` | CREATE | Dialog shell wrapping shadcn/ui Dialog, renders title + close |
| `src/components/modals/alert-modal-content.tsx` | CREATE | Renders content based on alertType (placeholder for V1/V2/V3) |
| `src/components/modals/__tests__/alert-modal-dialog.test.tsx` | CREATE | Tests for dialog shell |
| `src/providers/wizard-modal-types.ts` | CREATE | `WizardConfig`, `WizardStep`, `WizardModalState` types |
| `src/providers/wizard-modal-provider.tsx` | CREATE | Context + Provider + portal + `useWizard()` hook (stub) |
| `src/providers/__tests__/wizard-modal-provider.test.tsx` | CREATE | Tests for wizard provider stub |
| `src/providers/app-providers.tsx` | MODIFY | Mount `AlertModalProvider` and `WizardModalProvider` |
| `docs/guides/wizard-modal-setup.md` | CREATE | How-to guide for future wizard implementations |

---

### Task 1: AlertModal Types + Provider

**Files:**
- Create: `src/providers/alert-modal-types.ts`
- Create: `src/providers/alert-modal-provider.tsx`
- Create: `src/providers/__tests__/alert-modal-provider.test.tsx`

**Interfaces:**
- Consumes: Nothing (standalone)
- Produces: `useAlertModal()` hook → `{ openAlert, closeAlert, state }`

- [ ] **Step 1: Create types file**

```typescript
// src/providers/alert-modal-types.ts
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
```

- [ ] **Step 2: Create provider file**

```typescript
// src/providers/alert-modal-provider.tsx
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
      <Dialog open={state.isOpen} onOpenChange={(open) => { if (!open) closeAlert(); }}>
        <DialogContent>
          <p>AlertModal content placeholder</p>
        </DialogContent>
      </Dialog>
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
```

- [ ] **Step 3: Write the failing tests**

```tsx
// src/providers/__tests__/alert-modal-provider.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertModalProvider, useAlertModal } from "../alert-modal-provider";

function TestConsumer() {
  const { openAlert, closeAlert, state } = useAlertModal();
  return (
    <div>
      <span data-testid="is-open">{String(state.isOpen)}</span>
      <span data-testid="alert-type">{state.alertType ?? "null"}</span>
      <button onClick={() => openAlert("critical", { id: 1 })}>
        Open Critical
      </button>
      <button onClick={() => openAlert("warning")}>Open Warning</button>
      <button onClick={closeAlert}>Close</button>
    </div>
  );
}

function renderWithProvider(ui: React.ReactElement) {
  return render(<AlertModalProvider>{ui}</AlertModalProvider>);
}

describe("AlertModalProvider", () => {
  it("renders children", () => {
    renderWithProvider(<div>test child</div>);
    expect(screen.getByText("test child")).toBeInTheDocument();
  });

  it("starts with isOpen false and alertType null", () => {
    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
    expect(screen.getByTestId("alert-type")).toHaveTextContent("null");
  });

  it("sets isOpen to true and alertType on openAlert", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Open Critical"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
    expect(screen.getByTestId("alert-type")).toHaveTextContent("critical");
  });

  it("resets state on closeAlert", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Open Critical"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
    await user.click(screen.getByText("Close"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
    expect(screen.getByTestId("alert-type")).toHaveTextContent("null");
  });
});

describe("useAlertModal", () => {
  it("throws when used outside provider", () => {
    function BadComponent() {
      useAlertModal();
      return null;
    }
    expect(() => render(<BadComponent />)).toThrow(
      "useAlertModal must be used within an AlertModalProvider"
    );
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `pnpm --filter frontend test -- --testPathPattern="alert-modal-provider" -t`
Expected: Tests fail with relevant errors (types not found, module not found)

- [ ] **Step 5: Create the provider files to make tests pass**

Execute Steps 1-2 above.

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm --filter frontend test -- --testPathPattern="alert-modal-provider" -t`
Expected: 5/5 passing

- [ ] **Step 7: Commit**

```bash
git add src/providers/alert-modal-types.ts src/providers/alert-modal-provider.tsx src/providers/__tests__/alert-modal-provider.test.tsx
git commit -m "feat: add AlertModal provider with context and portal"
```

---

### Task 2: AlertModal Dialog Shell + Content Renderer

**Files:**
- Create: `src/components/modals/alert-modal-dialog.tsx`
- Create: `src/components/modals/alert-modal-content.tsx`
- Create: `src/components/modals/__tests__/alert-modal-dialog.test.tsx`

**Interfaces:**
- Consumes: `useAlertModal()` from Task 1
- Produces: Reusable dialog shell that callers embed or render via the provider

- [ ] **Step 1: Create the AlertModal dialog shell**

```typescript
// src/components/modals/alert-modal-dialog.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAlertModal } from "@/providers/alert-modal-provider";

const TITLE_MAP: Record<string, string> = {
  critical: "Alertas Críticas",
  warning: "Alertas",
  info: "Información",
};

export function AlertModalDialog() {
  const { state, closeAlert } = useAlertModal();
  const { isOpen, alertType } = state;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeAlert(); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[80dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {alertType ? TITLE_MAP[alertType] ?? "Alertas" : "Alertas"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Contenido de alertas pendientes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Create the AlertModal content renderer**

```typescript
// src/components/modals/alert-modal-content.tsx
"use client";

import type { AlertType } from "@/providers/alert-modal-types";

interface AlertModalContentProps {
  alertType: AlertType;
  data?: unknown;
}

export function AlertModalContent({ alertType, data }: AlertModalContentProps) {
  // Future: render V1/V2/V3 alert content based on alertType
  // For now, a simple placeholder
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
```

- [ ] **Step 3: Update the provider to use AlertModalContent**

Edit `src/providers/alert-modal-provider.tsx`:
- Replace the inline Dialog content with `<AlertModalContent alertType={state.alertType} data={state.data} />`
- Import from `@/components/modals/alert-modal-content`

- [ ] **Step 4: Write the dialog tests**

```tsx
// src/components/modals/__tests__/alert-modal-dialog.test.tsx
import { render, screen } from "@testing-library/react";
import { AlertModalProvider, useAlertModal } from "@/providers/alert-modal-provider";
import { AlertModalDialog } from "../alert-modal-dialog";

function TestOpener({ alertType = "critical" as const }) {
  const { openAlert } = useAlertModal();
  return (
    <button onClick={() => openAlert(alertType)}>
      Open {alertType}
    </button>
  );
}

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <AlertModalProvider>
      {ui}
      <AlertModalDialog />
    </AlertModalProvider>
  );
}

describe("AlertModalDialog", () => {
  it("shows correct title for critical alerts", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    renderWithProvider(<TestOpener alertType="critical" />);
    await user.click(screen.getByText("Open critical"));
    expect(screen.getByText("Alertas Críticas")).toBeInTheDocument();
  });

  it("shows correct title for warning alerts", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    renderWithProvider(<TestOpener alertType="warning" />);
    await user.click(screen.getByText("Open warning"));
    expect(screen.getByText("Alertas")).toBeInTheDocument();
  });

  it("shows correct title for info alerts", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    renderWithProvider(<TestOpener alertType="info" />);
    await user.click(screen.getByText("Open info"));
    expect(screen.getByText("Información")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `pnpm --filter frontend test -- --testPathPattern="alert-modal-dialog" -t`
Expected: Tests fail (module import errors)

- [ ] **Step 6: Create files to make tests pass**

Execute Steps 1-3 above.

- [ ] **Step 7: Run tests to verify they pass**

Run: `pnpm --filter frontend test -- --testPathPattern="alert-modal-(dialog|provider)" -t`
Expected: All tests passing

- [ ] **Step 8: Commit**

```bash
git add src/components/modals/ src/providers/alert-modal-provider.tsx
git commit -m "feat: add AlertModal dialog shell and content renderer"
```

---

### Task 3: WizardModal Types + Provider (Stub)

**Files:**
- Create: `src/providers/wizard-modal-types.ts`
- Create: `src/providers/wizard-modal-provider.tsx`
- Create: `src/providers/__tests__/wizard-modal-provider.test.tsx`

**Interfaces:**
- Consumes: Nothing (standalone)
- Produces: `useWizard()` hook → `{ openWizard, closeWizard, nextStep, prevStep, state }`

- [ ] **Step 1: Create types file**

```typescript
// src/providers/wizard-modal-types.ts
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
```

- [ ] **Step 2: Create provider stub**

```typescript
// src/providers/wizard-modal-provider.tsx
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
```

- [ ] **Step 3: Write the failing tests**

```tsx
// src/providers/__tests__/wizard-modal-provider.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WizardModalProvider, useWizard } from "../wizard-modal-provider";
import type { WizardConfig } from "../wizard-modal-types";

const mockConfig: WizardConfig = {
  title: "Test Wizard",
  steps: [
    { id: "step1", label: "Step 1", component: () => <div>Step 1</div> },
    { id: "step2", label: "Step 2", component: () => <div>Step 2</div> },
  ],
  onComplete: jest.fn(),
};

function TestConsumer() {
  const { openWizard, closeWizard, state } = useWizard();
  return (
    <div>
      <span data-testid="is-open">{String(state.isOpen)}</span>
      <button onClick={() => openWizard(mockConfig)}>Open Wizard</button>
      <button onClick={closeWizard}>Close</button>
    </div>
  );
}

function renderWithProvider(ui: React.ReactElement) {
  return render(<WizardModalProvider>{ui}</WizardModalProvider>);
}

describe("WizardModalProvider", () => {
  it("renders children", () => {
    renderWithProvider(<div>test child</div>);
    expect(screen.getByText("test child")).toBeInTheDocument();
  });

  it("starts with isOpen false", () => {
    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });

  it("sets isOpen to true on openWizard", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Open Wizard"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
  });

  it("resets state on closeWizard", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Open Wizard"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
    await user.click(screen.getByText("Close"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });
});

describe("useWizard", () => {
  it("throws when used outside provider", () => {
    function BadComponent() {
      useWizard();
      return null;
    }
    expect(() => render(<BadComponent />)).toThrow(
      "useWizard must be used within a WizardModalProvider"
    );
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `pnpm --filter frontend test -- --testPathPattern="wizard-modal-provider" -t`
Expected: Tests fail

- [ ] **Step 5: Create files to make tests pass**

Execute Steps 1-2 above.

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm --filter frontend test -- --testPathPattern="wizard-modal-provider" -t`
Expected: 5/5 passing

- [ ] **Step 7: Commit**

```bash
git add src/providers/wizard-modal-types.ts src/providers/wizard-modal-provider.tsx src/providers/__tests__/wizard-modal-provider.test.tsx
git commit -m "feat: add WizardModal provider stub with context and portal"
```

---

### Task 4: Mount Providers in AppProviders

**Files:**
- Modify: `src/providers/app-providers.tsx`

**Interfaces:**
- Consumes: `AlertModalProvider` from Task 1, `WizardModalProvider` from Task 3
- Produces: Working global modal system accessible from any page

- [ ] **Step 1: Mount both providers in AppProviders**

Edit `src/providers/app-providers.tsx`:

```typescript
// src/providers/app-providers.tsx
"use client";

import { ErrorBoundary } from "@/components/error/error-boundary";
import { ReactClientProvider } from "./query-client-provider";
import { ThemeProvider } from "./theme-provider";
import { ErrorProvider } from "./error-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertModalProvider } from "./alert-modal-provider";
import { WizardModalProvider } from "./wizard-modal-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <TooltipProvider delayDuration={200}>
          <ReactClientProvider>
            <ThemeProvider>
              <AlertModalProvider>
                <WizardModalProvider>
                  {children}
                </WizardModalProvider>
              </AlertModalProvider>
              <Toaster richColors position="top-center" closeButton />
            </ThemeProvider>
          </ReactClientProvider>
        </TooltipProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `pnpm --filter frontend type-check` or `pnpm type-check`
Expected: No type errors

- [ ] **Step 3: Verify build passes**

Run: `pnpm --filter frontend build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/providers/app-providers.tsx
git commit -m "feat: mount AlertModal and WizardModal providers in AppProviders"
```

---

### Task 5: Wizard Setup Guide

**Files:**
- Create: `docs/guides/wizard-modal-setup.md`

**Interfaces:**
- Consumes: WizardModal types + provider from Task 3
- Produces: Documentation for future wizard implementations

- [ ] **Step 1: Write the wizard setup guide**

```markdown
# WizardModal Setup Guide

This guide explains how to implement a concrete wizard using the WizardModal infrastructure.

## Architecture

The WizardModal provides:
- `useWizard()` — hook to open/close/navigate steps
- A portal-rendered Dialog
- Step navigation state (currentStep, formData)
- No step rendering logic — you provide the steps

## Creating a Wizard

### 1. Define your steps

Each step is a React component that receives step data:

```typescript
import type { WizardStep, WizardConfig } from "@/providers/wizard-modal-types";

function StepOne({ onNext }: { onNext: (data: unknown) => void }) {
  const [value, setValue] = useState("");
  return (
    <div>
      <h2>Step 1</h2>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={() => onNext({ value })}>Next</button>
    </div>
  );
}
```

### 2. Build the config

```typescript
const config: WizardConfig = {
  title: "Create Transaction",
  steps: [
    { id: "account", label: "Account", component: StepOne },
    { id: "amount", label: "Amount", component: StepTwo },
    { id: "review", label: "Review", component: ReviewStep },
  ],
  onComplete: async (data) => {
    await api.createTransaction(data);
  },
};
```

### 3. Open the wizard

```typescript
const { openWizard } = useWizard();
<button onClick={() => openWizard(config)}>New Transaction</button>
```

### 4. Navigate steps

Each step component receives navigation callbacks from a wizard context wrapper. Use `nextStep(stepData)` to advance and merge data.

## Validation Pattern

Wrap each step's form with a Zod schema. Call `nextStep()` only after validation passes.

```typescript
function handleNext() {
  const result = stepSchema.safeParse(formValues);
  if (!result.success) {
    // show errors
    return;
  }
  nextStep(result.data);
}
```

## Review/Summary Step

The last step should show all collected data and call `onComplete`:

```typescript
function ReviewStep() {
  const { state } = useWizard();
  const { formData, config } = state;

  return (
    <div>
      <h2>Review</h2>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
      <button onClick={() => config!.onComplete(formData)}>Submit</button>
    </div>
  );
}
```
```

- [ ] **Step 2: Format the doc**

Run: `pnpm format`
Expected: No formatting errors

- [ ] **Step 3: Commit**

```bash
git add docs/guides/wizard-modal-setup.md
git commit -m "docs: add wizard modal setup guide"
```

---

### Task 6: Final Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run full test suite**

Run: `pnpm test`
Expected: All unit tests passing (87+ tests — existing + new)

- [ ] **Step 2: Run type check**

Run: `pnpm type-check`
Expected: No type errors

- [ ] **Step 3: Run build**

Run: `pnpm --filter frontend build`
Expected: Build succeeds

- [ ] **Step 4: Verify git status is clean**

Run: `git status`
Expected: No uncommitted changes (all files committed in previous tasks)
