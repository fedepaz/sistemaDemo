# Manual Sowing Date (`f_siembra`) on Completar Siembra

**Date:** 2026-10-18
**Status:** Approved

## Problem

When an operator completes a sowing (`asignar-siembra`), the backend stamps `partidas.f_siembra` with `new Date()` at submit time (`partidas.service.ts`). During the migration from Access, operators submit late: Friday's sowing is entered on Monday, after the weekend, or whenever they reach a terminal. The sowing date recorded in the database is the *submission* date, not the date the sowing actually happened.

The date used to be a form field; it was removed from the DTO schema on 2026-09-13 (`a976726`). It must come back as a manual, operator-entered field.

## Goal

Let the operator enter the actual sowing day, stored as `partidas.f_siembra` in the legacy MySQL format (`YYYY-MM-DD`), congruent with what the Access system wrote and what the extendidos flow reads. The chosen date also governs the TaskShift start/end timestamps, so all times recorded for the task belong to the same workday.

## Requirements

1. A required "Fecha de Siembra" field in the completar form (`a-sembrar-edit-form.tsx`), positioned before the TaskShift block.
2. No default value: the field opens empty unless the partida already has an `f_siembra` (prefill), in which case the existing value is shown and can be accepted or changed.
3. Allowed range: from 14 days back to today. Future dates are invalid.
4. The date drives both `partidas.f_siembra` and the TaskShift start/end stamps (play/stop buttons and the hour/minute selects).
5. The value that reaches MySQL is the operator's wall-clock day, `YYYY-MM-DD`, with no timezone conversion anywhere on the path.
6. Storage format is exactly what extendidos expects from `partidas.f_siembra`: a real `DATE`, never `0000-00-00`, never null, never a datetime — so `DATE_ADD(f_siembra, INTERVAL camara DAY)` and the `<> '0000-00-00'` filters keep working unchanged.

## Design

### Shared contract (`packages/shared/src/schemas/partidas.schema.ts`)

Add to `AsignarUbiSiembraDtoSchema` (alongside `cantidadGrs`, same pattern):

- `fSiembra: z.string()` — required, format `YYYY-MM-DD` (regex `^\d{4}-\d{2}-\d{2}$`), plus a parseability refine (`new Date(s)` is not `NaN`) so calendar-invalid values like `2026-10-99` are rejected despite matching the regex.
- Hard rule enforced on both sides (browser via zodResolver, server via `ZodValidationPipe`): **not in the future** (the parsed date, compared against today, must be `<= today`).
- The 14-day lower bound is a **UI constraint only** (native input `min`/`max`), not a schema refinement, so a pre-filled legacy date older than 14 days can still be submitted as-is. Typing an older date is discouraged by the picker, not blocked by the server. Implementation requirement: the form element carries `noValidate` so `requestSubmit()` never lets native `min`/`max` constraint validation block an out-of-window prefill.
- Spanish validation messages, matching the rest of the schema.
- `field-labels.ts`: `fSiembra: "Fecha de Siembra"`.

The DTO field is named `fSiembra` (camelCase in shared, like `cantidadGrs`); the legacy column it maps to is `partidas.f_siembra`.

### Backend

**`partidas.service.ts`** — `completarSiembraLegacy`:

- `f_siembra: new Date()` becomes `f_siembra: data.fSiembra` (the string from the DTO).
- The SIEMBRA audit event's `changes.body` gains `fSiembra: data.fSiembra`, next to `cantidadGrs` and `c`.
- No new service-level validation: the pipe already ran the schema.

**`partidas.repository.ts`** — `asignarSiembra`:

- The `f_siembra` field in the data type changes from `Date` to `string`.
- The `new Date(data.f_siembra)` / `toISOString().slice(0, 10)` conversion is **deleted**; the string is passed straight to `UPDATE partidas SET f_siembra = ?`.
- Rationale: `YYYY-MM-DD` is MySQL's native `DATE` literal; passing the operator's string through eliminates the `Date`-object round-trip and its UTC pitfalls entirely (see Background).

### Frontend

**`a-sembrar-edit-form.tsx`** — new `FormField` named `fSiembra`, between the technical-fields block (método) and `<TaskShift>`:

- `<Input type="date">` — the browser/OS date picker: shows `dd/mm/aaaa` in Argentina, is keyboard-friendly, and its value is natively `YYYY-MM-DD`. No new dependencies; `react-day-picker` stays unused.
- `min` = today minus 14 days, `max` = today (computed with local date helpers).
- Label "Fecha de Siembra", icon in the same style as the neighboring fields, description: "Día en que se realizó la siembra".
- Standard `FormMessage` error display.

**`taskShift.tsx`** — new required prop `workDate: string` (`YYYY-MM-DD`):

- The component currently computes `today = getLocalDateStr(new Date())` and stamps all times with it. It uses `workDate` for every stamp instead: `handleStart`, `handleStop`, and the hour/minute `Select` handlers (`toDateTimeString(workDate, ...)`).
- A `workDate || getLocalDateStr(new Date())` fallback keeps the component safe if rendered without the prop; the form always passes it.
- The hint text changes from "para hoy ({today})" to "para el {workDate}".
- If the operator changes the date after pressing play, already-captured start/end keep their original date; only later stamps use the new date. Simplest correct behavior; no extra UI.

**`a-sembrar-data-table.tsx`** — `handleEdit` reset gains `fSiembra`, prefilled from `row.fSiembra` when present, `undefined` when not. A small `YYYY-MM-DD` formatter (in `lib/date-utils.ts`) normalizes whatever the API returned (string or Date) for the input value.

**Summary display** — the completion summary fields include "Fecha de Siembra" so the operator sees the date being submitted.

### Explicitly out of scope

- **Extendidos flow**: no changes. The extendidos form has no date field; its own write of `partidas2.fecha` (`new Date().toISOString().slice(0, 10)` in `asignarExtendido`) keeps its UTC behavior — a known quirk, different flow, different fix.
- **Timezone conversion utilities**: none introduced; the value is text in, text out.
- **Calendar component**: not built; the native input is sufficient.
- **Reintroducing the removed stock-traceability snapshot columns**: unrelated.

## Data flow

```
Operator picks dd/mm/aaaa (browser, local wall clock)
  → form value "YYYY-MM-DD" (native input, no conversion)
  → DTO fSiembra: string        [zod: required + format + not-future]
  → ZodValidationPipe           [server: same schema]
  → completarSiembraLegacy: f_siembra = data.fSiembra
  → asignarSiembra: UPDATE partidas SET f_siembra = 'YYYY-MM-DD'   [string → SQL, no Date]
  → partidas.f_siembra = the chosen day

Same form value → TaskShift workDate
  → play/stop stamp start/end on that date (toDateTimeString(workDate, hh:mm))
  → taskShifts startTime/endTime ISO strings carry the chosen day
```

## Consequences

- Backdated sowings flow into extendidos correctly: `fechaEgresoCamara = f_siembra + camara days` now counts from the day the sowing actually happened.
- The audit trail records which day the sowing is attributed to, not just when the record was saved.
- The UTC midnight quirk that affected the old `new Date()` stamp (submits after 21:00 ART writing tomorrow's date) is gone for `f_siembra`.

## Background: the UTC quirk (why string pass-through)

`Date.prototype.toISOString()` always returns UTC. In Argentina (UTC-3), any `new Date()` after 21:00 local yields the *next* day in UTC. The old path (`f_siembra: new Date()` → `toISOString().slice(0, 10)`) could write a future date after evening submits. Parsing the DTO string with `new Date("YYYY-MM-DD")` would reintroduce the same class of risk (it parses as UTC midnight). The chosen design never constructs a `Date` object on the backend for this field.

## Testing

**Shared** (`partidas.schema.spec.ts`):
- accepts `fSiembra: "2026-10-16"`
- rejects missing/empty
- rejects bad formats (`"16/10/2026"`, `"2026-10-16T10:00:00Z"`, `"abc"`)
- rejects calendar-invalid dates (`"2026-10-99"`)
- rejects a future date

**Backend**:
- `partidas.service.spec.ts`: `asignarSiembra` receives `f_siembra: "2026-10-16"` (plain string); audit body includes `fSiembra`
- `partidas.repository.spec.ts`: SQL params pin the string; no `Date` in the params
- pipe: invalid DTO (future date) → 400

**Frontend**:
- edit form: field renders; min/max attributes present; required error when empty
- data table: `handleEdit` prefills from `row.fSiembra`; empty when null
- taskShift: start/stop stamp the passed `workDate`, not today

**Verification order**: `pnpm lint && pnpm type-check && pnpm test`, plus the aSembrar and programacionSiembra suites.
