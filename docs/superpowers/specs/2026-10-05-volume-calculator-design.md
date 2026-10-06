# Volume Calculator (unit ↔ total, litres) — Design Spec

**Date:** 2026-10-05
**Status:** Approved (brainstorming session, 2026-10-05)
**Feature:** Frontend calculator for container volume in the autorizar-siembra form

## Context & Goal

The autorizar-siembra edit form (`autorizar-programacionSiembra-edit-form.tsx`)
displays *Detalle Fórmula* rows including `Tipo Contenedor` and
`Cantidad Tipo Contenedor` (`cantTipoCont`, an optional number from the legacy
LEFT JOIN). The user needs to reason about volume in **litres** via two related
values:

- **Valor Unitario** — litres per container (default `1`, user-editable, e.g. `0,740`)
- **Valor Total** — `unit × cantTipoCont` (e.g. `0,740 × 200 = 148`)

Editing either value must derive the other (last-edit-wins): someone who knows
only the total (e.g. `126`) types it and gets the unit (`126 ÷ 200 = 0,63`).

## Scope

- **In:** local, purely visual calculator inside the edit form; both fields
  editable; comma/dot input; comma display; 3-decimal rounding of derived
  values; minimal amber warning when the derived value is lossy; disabled
  state when `cantTipoCont` is null/0/undefined; unit tests.
- **Out (non-goals):** no `AutorizarSiembraDto`/API/backend/submit-payload
  changes; no persistence; no thousands-grouping in output; no min/max
  validation beyond numeric parseability.

## Files & Boundaries

| File | Responsibility |
|------|----------------|
| `apps/frontend/src/features/programacionSiembra/components/volumeCalculatorMath.ts` | Pure logic, zero React: `parseNumber`, `formatL`, `isLossy`, `isCalcDisabled`, `resolvePair` |
| `apps/frontend/src/features/programacionSiembra/components/volumeCalculator.tsx` | Self-contained component; owns both inputs and state; props: `{ qty: number \| null }` only |
| `apps/frontend/src/features/programacionSiembra/components/__tests__/volumeCalculatorMath.test.ts` | Jest unit tests for the pure logic |
| `apps/frontend/src/features/programacionSiembra/components/__tests__/volumeCalculator.test.tsx` | Jest component tests (RTL) |
| `apps/frontend/src/features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx` | Replaces the two sketch `InfoRow`s with `<VolumeCalculator />`; removes the unused `useState`/handlers |

Component lives in the same folder as `formulaSelector.tsx` (user requirement).
Tests live in the feature's existing `components/__tests__/` folder (Jest +
Testing Library, existing convention).

## Math & Formatting Rules

### Parsing (`parseNumber(raw: string): number | null`)

- Trim; empty → `null`.
- If the string contains `,`: remove all `.`, then replace `,` with `.` —
  accepts `0,740` and grouped `1.234,5`.
- Otherwise parse as-is (dot decimal): `0.740`, `200`.
- Non-finite result → `null` (e.g. `abc`).

### Formatting (`formatL(value: number): string`)

- Round to **3 decimals** (`Math.round(v * 1000) / 1000`).
- `toFixed(3)`, trim trailing zeros and bare dot (`148.000 → "148"`,
  `0.630 → "0.63"`, `0.000 → "0"`).
- Decimal separator output is **comma**: `"0,63"`, `"33,333"`.
- No thousands grouping.

### Lossy detection (`isLossy(value: number): boolean`)

- `|value * 1000 - Math.round(value * 1000)| > 1e-6`.
- Epsilon prevents false positives from float noise (`0.1 × 3` → `false`);
  genuinely inexact divisions (`100 ÷ 3` → `true`) trigger the warning.
- The warning marks the **derived** side only (the field the user is *not*
  typing in).

### Pair resolution (`resolvePair({ unitRaw, totalRaw, qty, source }): { unit, total, lossy }`)

- `qty == null || qty <= 0` → `{ unit: "1", total: "—", lossy: false }`
  (component renders both inputs disabled + hint `Sin cantidad de contenedor`).
- `source === "unit"`: unit displayed **exactly as typed**; if parseable,
  `total = formatL(unit × qty)`, `lossy = isLossy(unit × qty)`; else
  `total = "—"`.
- `source === "total"`: symmetric — total kept as typed, unit derived
  (`formatL(total ÷ qty)`, `isLossy`); unparsable total → unit `"—"`.

## State & Integration

- Component state: `{ unitRaw: string; totalRaw: string; source: 'unit' | 'total' }`
  with initial `{ unitRaw: "1", totalRaw: "", source: "unit" }` — mount shows
  unit `1` and total `formatL(1 × qty)` (or `—` when disabled).
- Inputs: `type="text"` + `inputMode="decimal"` (comma-capable), compact,
  right-aligned, row layout matching `InfoRow` (same flex/label styles);
  disabled state dims (`disabled:opacity-50`).
- Labels: `Valor Unitario (L)` / `Valor Total (L)`; hint line
  `Sin cantidad de contenedor` when disabled.
- Warning: minimal amber `≈` span next to the derived input,
  `text-warning`, `title`/`aria-label` = `Valor aproximado (redondeado a 3 decimales)`.
- Parent integration: the edit form replaces its two `InfoRow`s with
  `<VolumeCalculator key={\`${partidaId}-${anio}-${indice}\`}
  qty={selectedSiembra.cantTipoCont ?? null} />` — the `key` resets calculator
  state when the slide-over switches partidas.

## Testing

- **Math (pure):** comma/dot/grouped parsing; empty/garbage → `null`;
  `formatL` integer/decimal/trim/zero cases; `isLossy` true (`100/3`), false
  (exact, FP-noise); `isCalcDisabled` matrix (null/undefined/0/negative → true);
  `resolvePair` default, both directions, disabled qty, unparsable input.
- **Component:** renders default `1` + derived total for `qty`; typing in unit
  updates total (`0,740` → `148` at qty 200); typing in total updates unit
  (`126` → `0,63`); disabled when `qty` null (+hint visible, inputs disabled);
  `≈` appears exactly once and only on the derived side when lossy
  (`qty 3`, total `100` → unit `33,333`).
- **Gates:** `pnpm lint && pnpm type-check && pnpm test` (all green; current
  sketch fails type-check `TS18048` — fixed by this design removing the
  offending handlers).

## Open Follow-ups (explicitly out of scope)

- Persisting unit/total with the autorizar payload (future DTO extension).
- Using `GET /l-contenedor` (`LegacyTipoContenedorModule`, commit `b3f1626`)
  to validate `cantTipoCont` against container catalog data.
