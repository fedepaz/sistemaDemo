# AlertModal & WizardModal Design

**Date:** 2026-07-21
**Status:** Approved design — ready for implementation

---

## Overview

Two reusable modal systems that share the same context+portal infrastructure pattern but serve distinct purposes:

- **AlertModal**: A centered Dialog that shows alert details/actions. Can render any alert version (V1/V2/V3) inside its body. Triggered from a global context — any component can open it.
- **WizardModal**: A centered multi-step Dialog for complex forms with sequential steps and a summary/review step. Infrastructure + types only now; actual step rendering ships when a real wizard is needed.

Both are independently usable — they have separate providers, separate contexts, and separate concerns.

---

## Architecture

```
AppProviders (apps/frontend/src/providers/app-providers.tsx)
  ├── ... (existing providers)
  ├── AlertModalProvider          ← global context
  │     └── <AlertModalPortal>    ← renders in a React portal at body level
  │           └── <Dialog>        ← shadcn/ui Dialog (centered)
  │                 └── content component based on alertType
  └── WizardModalProvider         ← global context (stub — types only now)
        └── <WizardModalPortal>
              └── <Dialog>
                    └── step renderer (future implementation)
```

Both providers follow the same pattern:
- A React Context holding open/close state + configuration
- A portal-rendered modal at the app root
- `useAlertModal()` / `useWizard()` hooks accessible from any component
- No prop drilling — call `openAlert()` or `openWizard()` from anywhere

---

## AlertModal

### Contract

```typescript
// apps/frontend/src/providers/alert-modal-provider.tsx

type AlertType = 'critical' | 'warning' | 'info' | null

interface AlertModalState {
  isOpen: boolean
  alertType: AlertType | null
  data?: unknown  // passed through to the content renderer
}

interface AlertModalContextType {
  openAlert: (alertType: AlertType, data?: unknown) => void
  closeAlert: () => void
  state: AlertModalState
}
```

### Behavior

- `openAlert(type, data?)` → sets state, opens the Dialog
- `closeAlert()` → resets state, closes the Dialog
- Dialog behavior (all handled by shadcn/ui `Dialog`):
  - Escape key closes
  - Backdrop click closes
  - X button closes
  - Focus trap while open
  - Focus returns to trigger element on close
- Content is rendered inside the Dialog body based on `alertType`:
  - The content components (V1/V2/V3 panels) handle their own data fetching
  - The modal provider does NOT fetch — it's purely a container
- On mobile: Dialog collapses to full-screen (responsive styling via shadcn)
- Animation: default Dialog fade + scale animation (shadcn default)

### Usage

```tsx
// Anywhere in the app:
const { openAlert } = useAlertModal()

// In a trigger button:
<button onClick={() => openAlert('critical', optionalData)}>
  <Bell />
  {count > 0 && <Badge>{count}</Badge>}
</button>
```

### File Structure

| File | Action | Description |
|------|--------|-------------|
| `src/providers/alert-modal-provider.tsx` | CREATE | Context + Provider + Portal |
| `src/providers/alert-modal-types.ts` | CREATE | Types for AlertModal |
| `src/components/modals/alert-modal-dialog.tsx` | CREATE | Dialog shell that wraps shadcn Dialog |
| `src/components/modals/alert-modal-content.tsx` | CREATE | Renders the correct content based on alertType |

---

## WizardModal

### Contract (Infrastructure Only)

```typescript
// apps/frontend/src/providers/wizard-modal-provider.tsx

interface WizardStep {
  id: string
  label: string
  component: React.ComponentType  // future: actual step components
}

interface WizardConfig {
  title: string
  steps: WizardStep[]
  onComplete: (data: unknown) => Promise<void>
  initialData?: unknown
}

interface WizardModalState {
  isOpen: boolean
  config: WizardConfig | null
  currentStep: number
  formData: Record<string, unknown>
}

interface WizardModalContextType {
  openWizard: (config: WizardConfig) => void
  closeWizard: () => void
  nextStep: (stepData: unknown) => void
  prevStep: () => void
}
```

### What's Created Now

- Provider stub with context + open/close state
- Portal rendering the Dialog shell
- No step rendering logic
- A reference doc `docs/guides/wizard-modal-setup.md` explaining how to:
  1. Define steps with Zod schemas
  2. Add step validation gates
  3. Build the summary/review step
  4. Wire `onComplete` for final submission

### File Structure

| File | Action | Description |
|------|--------|-------------|
| `src/providers/wizard-modal-provider.tsx` | CREATE | Context + Provider + Portal (stub) |
| `src/providers/wizard-modal-types.ts` | CREATE | Types + utility interfaces |
| `docs/guides/wizard-modal-setup.md` | CREATE | How-to guide for future wizard implementations |

---

## Provider Mounting

Both providers mount in `apps/frontend/src/providers/app-providers.tsx`, inside the existing provider tree (after `ThemeProvider`, before `Toaster`).

Order doesn't matter between them — they're independent.

---

## Testing

- **AlertModalProvider**: Test that `openAlert`/`closeAlert` update state correctly, that the Dialog opens/closes on state changes
- **useAlertModal**: Test that the hook throws when used outside the provider
- **WizardModalProvider**: Test basic open/close state only (no step logic yet)
- Test Dialog behavior: Escape, backdrop click, X button all close the modal
- Test that focus is restored to trigger element on close (shadcn handles this)

---

## Non-Goals

- No AlertModal styling decisions — uses existing shadcn Dialog styling
- No trigger button component — just the hook, users build their own trigger
- No data fetching in the providers — content components handle their own data
- No WizardModal step rendering — that ships with the first real wizard feature
- No `NotificationCenter` integration — that's a separate concern
