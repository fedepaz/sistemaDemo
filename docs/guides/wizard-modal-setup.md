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
