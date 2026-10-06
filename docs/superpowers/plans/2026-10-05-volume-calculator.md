# Volume Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local litre calculator (Valor Unitario ↔ Valor Total) to the autorizar-siembra edit form, with last-edit-wins derivation, comma/dot input, 3-decimal derived rounding, and a minimal lossy warning.

**Architecture:** Pure logic module (`volumeCalculatorMath.ts`) with zero React, a self-contained presentational component (`volumeCalculator.tsx`) that owns its state, and a thin integration into the existing edit form replacing two read-only rows. No DTO/API/backend changes.

**Tech Stack:** React 19 + TypeScript, Tailwind v4 (design tokens only), Jest + Testing Library (frontend), pnpm workspaces.

## Global Constraints

- Design system tokens only — no arbitrary values (`AGENTS.md` rule 6; e.g. `w-28` is fine, `w-[112px]` is not)
- Conventional Commits enforced by commitlint; save message to `.commits/YYYY-MM-DD-type-scope-description.md` and commit with `git commit -F`
- TDD: failing test → verify FAIL → implement → verify PASS → commit
- Verification order: `pnpm lint && pnpm type-check && pnpm test`
- Local-only feature: **no** changes to `AutorizarSiembraSchema`, API, or backend
- Spec: `docs/superpowers/specs/2026-10-05-volume-calculator-design.md` (source of truth)
- Known baseline: current tree fails type-check (`TS18048` ×2 in the edit form, from the uncommitted sketch handlers) — Task 3 removes those handlers and fixes it

---

### Task 1: Pure math module

**Files:**
- Create: `apps/frontend/src/features/programacionSiembra/components/volumeCalculatorMath.ts`
- Test: `apps/frontend/src/features/programacionSiembra/components/__tests__/volumeCalculatorMath.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces (used by Task 2):
  - `isCalcDisabled(qty: number | null | undefined): boolean`
  - `parseNumber(raw: string): number | null`
  - `formatL(value: number): string`
  - `isLossy(value: number): boolean`
  - `resolvePair(input: { unitRaw: string; totalRaw: string; qty: number | null | undefined; source: 'unit' | 'total' }): { unit: string; total: string; lossy: boolean }`

- [ ] **Step 1: Write the failing test**

Create `apps/frontend/src/features/programacionSiembra/components/__tests__/volumeCalculatorMath.test.ts`:

```ts
// __tests__/volumeCalculatorMath.test.ts
import {
  parseNumber,
  formatL,
  isLossy,
  isCalcDisabled,
  resolvePair,
} from "../volumeCalculatorMath";

describe("parseNumber", () => {
  it("parses dot decimals", () => {
    expect(parseNumber("0.740")).toBe(0.74);
  });

  it("parses comma decimals", () => {
    expect(parseNumber("0,740")).toBe(0.74);
  });

  it("parses plain integers", () => {
    expect(parseNumber("200")).toBe(200);
  });

  it("parses grouped thousands with comma", () => {
    expect(parseNumber("1.234,5")).toBe(1234.5);
  });

  it("returns null for empty string", () => {
    expect(parseNumber("")).toBeNull();
  });

  it("returns null for non-numeric input", () => {
    expect(parseNumber("abc")).toBeNull();
  });
});

describe("formatL", () => {
  it("formats whole numbers without decimals", () => {
    expect(formatL(148)).toBe("148");
  });

  it("rounds to 3 decimals and uses a comma", () => {
    expect(formatL(100 / 3)).toBe("33,333");
  });

  it("trims trailing zeros", () => {
    expect(formatL(0.63)).toBe("0,63");
  });

  it("formats zero", () => {
    expect(formatL(0)).toBe("0");
  });

  it("keeps meaningful decimals", () => {
    expect(formatL(0.74)).toBe("0,74");
  });
});

describe("isLossy", () => {
  it("flags values needing more than 3 decimals", () => {
    expect(isLossy(100 / 3)).toBe(true);
  });

  it("does not flag exact values", () => {
    expect(isLossy(148)).toBe(false);
    expect(isLossy(0.63)).toBe(false);
  });

  it("ignores floating point noise", () => {
    expect(isLossy(0.1 * 3)).toBe(false);
  });
});

describe("isCalcDisabled", () => {
  it("disables for null, undefined, zero and negatives", () => {
    expect(isCalcDisabled(null)).toBe(true);
    expect(isCalcDisabled(undefined)).toBe(true);
    expect(isCalcDisabled(0)).toBe(true);
    expect(isCalcDisabled(-5)).toBe(true);
  });

  it("enables for positive quantities", () => {
    expect(isCalcDisabled(0.5)).toBe(false);
    expect(isCalcDisabled(200)).toBe(false);
  });
});

describe("resolvePair", () => {
  const qty = 200;

  it("shows default unit 1 and derived total on mount", () => {
    expect(
      resolvePair({ unitRaw: "1", totalRaw: "", qty, source: "unit" }),
    ).toEqual({ unit: "1", total: "200", lossy: false });
  });

  it("derives total from a comma-typed unit", () => {
    expect(
      resolvePair({ unitRaw: "0,740", totalRaw: "", qty, source: "unit" }),
    ).toEqual({ unit: "0,740", total: "148", lossy: false });
  });

  it("derives unit from a typed total", () => {
    expect(
      resolvePair({ unitRaw: "", totalRaw: "126", qty, source: "total" }),
    ).toEqual({ unit: "0,63", total: "126", lossy: false });
  });

  it("flags lossy derivation when division exceeds 3 decimals", () => {
    const result = resolvePair({
      unitRaw: "",
      totalRaw: "100",
      qty: 3,
      source: "total",
    });
    expect(result.unit).toBe("33,333");
    expect(result.lossy).toBe(true);
  });

  it("shows a dash for an unparseable typed side", () => {
    expect(
      resolvePair({ unitRaw: "abc", totalRaw: "", qty, source: "unit" }),
    ).toEqual({ unit: "abc", total: "—", lossy: false });
  });

  it("returns defaults when qty is disabled", () => {
    expect(
      resolvePair({ unitRaw: "5", totalRaw: "", qty: null, source: "unit" }),
    ).toEqual({ unit: "1", total: "—", lossy: false });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm --filter frontend test -- volumeCalculatorMath
```

Expected: FAIL — module `../volumeCalculatorMath` not found.

- [ ] **Step 3: Write the minimal implementation**

Create `apps/frontend/src/features/programacionSiembra/components/volumeCalculatorMath.ts`:

```ts
// src/features/programacionSiembra/components/volumeCalculatorMath.ts

const DECIMALS = 3;
const EPSILON = 1e-6;
const DASH = "—";

export interface ResolvePairInput {
  unitRaw: string;
  totalRaw: string;
  qty: number | null | undefined;
  source: "unit" | "total";
}

export interface ResolvePairResult {
  unit: string;
  total: string;
  lossy: boolean;
}

export function isCalcDisabled(qty: number | null | undefined): boolean {
  return qty == null || qty <= 0;
}

export function parseNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function roundTo3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function formatL(value: number): string {
  const trimmed = roundTo3(value).toFixed(DECIMALS).replace(/\.?0+$/, "");
  return trimmed.replace(".", ",");
}

export function isLossy(value: number): boolean {
  return Math.abs(value * 1000 - Math.round(value * 1000)) > EPSILON;
}

export function resolvePair(input: ResolvePairInput): ResolvePairResult {
  const { unitRaw, totalRaw, qty, source } = input;
  if (isCalcDisabled(qty)) {
    return { unit: "1", total: DASH, lossy: false };
  }
  const q = qty as number;

  if (source === "unit") {
    const unit = parseNumber(unitRaw);
    if (unit == null) return { unit: unitRaw, total: DASH, lossy: false };
    const rawTotal = unit * q;
    return { unit: unitRaw, total: formatL(rawTotal), lossy: isLossy(rawTotal) };
  }

  const total = parseNumber(totalRaw);
  if (total == null) return { unit: DASH, total: totalRaw, lossy: false };
  const rawUnit = total / q;
  return { unit: formatL(rawUnit), total: totalRaw, lossy: isLossy(rawUnit) };
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm --filter frontend test -- volumeCalculatorMath
```

Expected: PASS — 1 suite, `Tests: 22 passed, 22 total`.

- [ ] **Step 5: Commit**

```bash
printf 'feat(programacionSiembra): add volume calculator math helper\n\nPure parse/format/lossy/resolve helpers for the litre calculator:\ncomma-or-dot parsing, 3-decimal comma formatting with zero trim,\nepsilon lossy detection, and last-edit-wins pair resolution with\ndisabled-qty defaults. TDD: 22 unit tests.\n' > .commits/2026-10-05-feat-programacionSiembra-volume-math.md
git add apps/frontend/src/features/programacionSiembra/components/volumeCalculatorMath.ts \
  apps/frontend/src/features/programacionSiembra/components/__tests__/volumeCalculatorMath.test.ts \
  .commits/2026-10-05-feat-programacionSiembra-volume-math.md
git commit -F .commits/2026-10-05-feat-programacionSiembra-volume-math.md
```

Expected: commit created, pre-commit lint passes.

---

### Task 2: VolumeCalculator component

**Files:**
- Create: `apps/frontend/src/features/programacionSiembra/components/volumeCalculator.tsx`
- Test: `apps/frontend/src/features/programacionSiembra/components/__tests__/volumeCalculator.test.tsx`

**Interfaces:**
- Consumes: `isCalcDisabled`, `resolvePair` from Task 1
- Produces: `<VolumeCalculator qty={number | null} />` — renders two editable rows + optional hint (used by Task 3)

- [ ] **Step 1: Write the failing test**

Create `apps/frontend/src/features/programacionSiembra/components/__tests__/volumeCalculator.test.tsx`:

```tsx
// __tests__/volumeCalculator.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { VolumeCalculator } from "../volumeCalculator";

describe("VolumeCalculator", () => {
  it("shows default unit 1 and derived total for qty", () => {
    render(<VolumeCalculator qty={200} />);

    expect(screen.getByLabelText("Valor Unitario (L)")).toHaveValue("1");
    expect(screen.getByLabelText("Valor Total (L)")).toHaveValue("200");
  });

  it("recomputes total when the unit is typed (comma accepted)", () => {
    render(<VolumeCalculator qty={200} />);

    fireEvent.change(screen.getByLabelText("Valor Unitario (L)"), {
      target: { value: "0,740" },
    });

    expect(screen.getByLabelText("Valor Total (L)")).toHaveValue("148");
  });

  it("recomputes unit when the total is typed", () => {
    render(<VolumeCalculator qty={200} />);

    fireEvent.change(screen.getByLabelText("Valor Total (L)"), {
      target: { value: "126" },
    });

    expect(screen.getByLabelText("Valor Unitario (L)")).toHaveValue("0,63");
  });

  it("disables inputs and shows a hint when qty is null", () => {
    render(<VolumeCalculator qty={null} />);

    expect(screen.getByLabelText("Valor Unitario (L)")).toBeDisabled();
    expect(screen.getByLabelText("Valor Total (L)")).toBeDisabled();
    expect(screen.getByLabelText("Valor Unitario (L)")).toHaveValue("1");
    expect(screen.getByLabelText("Valor Total (L)")).toHaveValue("—");
    expect(screen.getByText("Sin cantidad de contenedor")).toBeInTheDocument();
  });

  it("shows the approximate warning only on the derived side", () => {
    render(<VolumeCalculator qty={3} />);

    fireEvent.change(screen.getByLabelText("Valor Total (L)"), {
      target: { value: "100" },
    });

    expect(screen.getByLabelText("Valor Unitario (L)")).toHaveValue(
      "33,333",
    );
    const warnings = screen.getAllByLabelText(
      "Valor aproximado (redondeado a 3 decimales)",
    );
    expect(warnings).toHaveLength(1);
    const unitRow = screen.getByLabelText("Valor Unitario (L)").closest("div");
    expect(unitRow).toContainElement(warnings[0]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm --filter frontend test -- volumeCalculator.test
```

Expected: FAIL — cannot resolve `../volumeCalculator`.

- [ ] **Step 3: Write the implementation**

Create `apps/frontend/src/features/programacionSiembra/components/volumeCalculator.tsx`:

```tsx
// src/features/programacionSiembra/components/volumeCalculator.tsx
"use client";

import { useState } from "react";
import { isCalcDisabled, resolvePair } from "./volumeCalculatorMath";

interface VolumeCalculatorProps {
  qty: number | null;
}

interface CalcState {
  unitRaw: string;
  totalRaw: string;
  source: "unit" | "total";
}

interface CalcRowProps {
  label: string;
  value: string;
  disabled: boolean;
  lossy: boolean;
  onChange: (raw: string) => void;
}

function CalcRow({ label, value, disabled, lossy, onChange }: CalcRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-1.5 min-w-0">
        <input
          type="text"
          inputMode="decimal"
          aria-label={label}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 rounded-md border border-border/40 bg-transparent px-2 py-1 text-right text-xs font-bold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        />
        {lossy && (
          <span
            className="text-xs font-bold text-warning"
            title="Valor aproximado (redondeado a 3 decimales)"
            aria-label="Valor aproximado (redondeado a 3 decimales)"
          >
            ≈
          </span>
        )}
      </span>
    </div>
  );
}

export function VolumeCalculator({ qty }: VolumeCalculatorProps) {
  const [state, setState] = useState<CalcState>({
    unitRaw: "1",
    totalRaw: "",
    source: "unit",
  });

  const disabled = isCalcDisabled(qty);
  const { unit, total, lossy } = resolvePair({ ...state, qty });

  return (
    <>
      <CalcRow
        label="Valor Unitario (L)"
        value={unit}
        disabled={disabled}
        lossy={state.source === "total" && lossy}
        onChange={(raw) =>
          setState((s) => ({ ...s, unitRaw: raw, source: "unit" }))
        }
      />
      <CalcRow
        label="Valor Total (L)"
        value={total}
        disabled={disabled}
        lossy={state.source === "unit" && lossy}
        onChange={(raw) =>
          setState((s) => ({ ...s, totalRaw: raw, source: "total" }))
        }
      />
      {disabled && (
        <p className="px-3 pt-1 text-xs font-medium text-muted-foreground">
          Sin cantidad de contenedor
        </p>
      )}
    </>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm --filter frontend test -- volumeCalculator.test
```

Expected: PASS — `Tests: 5 passed`.

- [ ] **Step 5: Commit**

```bash
printf 'feat(programacionSiembra): add VolumeCalculator component\n\nSelf-contained litre calculator rows (Valor Unitario / Valor Total)\nfor the autorizar form: text inputs with inputMode=decimal (comma\naccepted), last-edit-wins derivation via resolvePair, amber lossy\nindicator on the derived side, disabled state + hint when qty is\nmissing. 5 component tests.\n' > .commits/2026-10-05-feat-programacionSiembra-volume-component.md
git add apps/frontend/src/features/programacionSiembra/components/volumeCalculator.tsx \
  apps/frontend/src/features/programacionSiembra/components/__tests__/volumeCalculator.test.tsx \
  .commits/2026-10-05-feat-programacionSiembra-volume-component.md
git commit -F .commits/2026-10-05-feat-programacionSiembra-volume-component.md
```

Expected: commit created, pre-commit lint passes.

---

### Task 3: Integrate into the edit form

**Files:**
- Modify: `apps/frontend/src/features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx`

**Interfaces:**
- Consumes: `<VolumeCalculator qty={number | null} />` from Task 2
- Produces: none (leaf change)

- [ ] **Step 1: Remove the sketch state and handlers**

In `autorizar-programacionSiembra-edit-form.tsx`, delete the `useState` import and the whole sketch block (it is the current `TS18048` failure source):

Remove line:

```tsx
import { useState } from "react";
```

Remove block (between `loteLabel` and `return`):

```tsx
  const [unitValue, setUnitValue] = useState<number | null>(null);
  const [totalValue, setTotalValue] = useState<number | null>(null);

  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setUnitValue(value);
    setTotalValue(value * selectedSiembra.cantTipoCont);
  };

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setTotalValue(value);
    setUnitValue(value / selectedSiembra.cantTipoCont);
  };
```

- [ ] **Step 2: Replace the read-only rows with the component**

Add import (alphabetically with the other relative imports):

```tsx
import { VolumeCalculator } from "./volumeCalculator";
```

Replace:

```tsx
            <InfoRow label="Valor Unitario" value={unitValue ?? "—"} />
            <InfoRow label="Valor Total" value={totalValue ?? "—"} />
```

With:

```tsx
            <VolumeCalculator
              key={`${selectedSiembra.partidaId}-${selectedSiembra.anio}-${selectedSiembra.indice}`}
              qty={selectedSiembra.cantTipoCont ?? null}
            />
```

(The `key` resets calculator state when the slide-over switches partidas.)

- [ ] **Step 3: Run verification gates**

```bash
pnpm lint && pnpm type-check && pnpm test
```

Expected: all exit 0. Baseline `TS18048` errors are gone; test totals: shared 226 / backend 344 / frontend 341 (314 existing + 22 math + 5 component) / integration 117.

- [ ] **Step 4: Manual smoke check**

```bash
pnpm dev
```

Open Programación de siembra → autorizar a partida → *Detalle Fórmula*:
- Unit shows `1`, total shows `cantTipoCont`
- Type `0,740` in unit → total updates with comma formatting
- Type a total → unit derives; if division is lossy (e.g. qty 3, total 100) amber `≈` appears on unit row only
- A partida without `cantTipoCont` shows disabled inputs + `Sin cantidad de contenedor`

Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
printf 'feat(programacionSiembra): wire volume calculator into autorizar form\n\nReplaces the read-only Valor Unitario/Valor Total InfoRows (and the\nunused sketch handlers that failed type-check) with the keyed\nVolumeCalculator component. Gates: lint, type-check, full test suite.\n' > .commits/2026-10-05-feat-programacionSiembra-volume-integration.md
git add apps/frontend/src/features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx \
  .commits/2026-10-05-feat-programacionSiembra-volume-integration.md
git commit -F .commits/2026-10-05-feat-programacionSiembra-volume-integration.md
```

Expected: commit created; `git status --short` shows a clean tree; **not pushed**.
