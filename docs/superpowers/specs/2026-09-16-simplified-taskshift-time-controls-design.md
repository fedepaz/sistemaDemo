# Simplified TaskShift Time Controls — Design Spec

## Context

The TaskShift component currently has 3 button states: Iniciar → Detener → Reiniciar. The user found this confusing — "Reiniciar" suggests pause/resume, and "Detener" is ambiguous. The goal is to simplify to a 2-step flow (Iniciar → Finalizar) with editable time fields revealed only after the action is complete. This is a first stage — future features (chronometer, pause/resume) may change this later.

## Decision

Progressive disclosure: buttons first, editable time selects after completion.

## Flow

```
[Initial State]
  startTime = "", endTime = ""
  Button: "Iniciar" (Play icon, primary)
  ─── User clicks "Iniciar" ───

[Running State]
  startTime = captured, endTime = ""
  Button: "Finalizar" (Square icon, destructive)
  (startTime hidden — user learns the button flow)
  ─── User clicks "Finalizar" ───

[Completed State]
  startTime = captured, endTime = captured
  NOW show editable time selects:
    Inicio: [Hora 00-23] : [Minuto 00-05-...-55]
    Fin:    [Hora 00-23] : [Minuto 00-05-...-55]
  (no more buttons — user can correct times before submitting)
```

## Button Changes

| State | Condition | Button Label | Icon | Action |
|-------|-----------|-------------|------|--------|
| Initial | `startTime === ""` | Iniciar | `Play` | Capture current time → `startTime` |
| Running | `startTime !== "" && endTime === ""` | Finalizar | `Square` | Capture current time → `endTime` |
| Completed | Both set | *(none)* | — | Show editable time selects |

**Removed:** "Reiniciar" button (RotateCcw icon, outline variant).

## Time Selects (visible after Finalizar)

Two rows, each with two `<select>` dropdowns:

- **Hora:** `00` through `23` (24 options)
- **Minuto:** `00`, `05`, `10`, `15`, `20`, `25`, `30`, `35`, `40`, `45`, `50`, `55` (12 options)

Pre-filled with the captured times (hours and minutes extracted from the ISO datetime string). User can change any value.

Each row has a label ("Inicio" / "Fin") and a clock icon, matching the existing display pattern.

## Validation

- Existing Zod schema (`endTime` must be after `startTime`) handles validation
- Inline error message shown below the time selects when validation fails
- Submit button stays enabled — user sees the error and can correct
- No disable-based validation

## Files to Modify

### 1. `apps/frontend/src/features/taskshift/components/taskShift.tsx`

- Remove `RotateCcw` import and "Reiniciar" button
- Rename button label from "Detener" to "Finalizar"
- After `hasEnded` (both times set): replace read-only time display with editable `<select>` dropdowns for hour/minute
- Extract hour/minute from ISO datetime string to pre-fill selects
- On select change: reconstruct ISO datetime string and call `onStartTimeChange` / `onEndTimeChange`
- Keep existing `toDateTimeString()` helper for reconstructing datetime strings from select values

### 2. `apps/frontend/src/features/aSembrar/components/a-sembrar-edit-form.tsx`

- Add `startTime`, `endTime` to `summaryFields` in the `confirm` config so they appear in the confirmation AlertDialog summary

## What Stays the Same

- Employee search/selection (unchanged)
- `toDateTimeString()` helper (unchanged)
- `getLocalDateStr()` and `utcToLocalTime()` utilities (unchanged)
- Backend schemas (`CreateTaskShiftSchema`, `UpdateTaskShiftSchema`) — already support updates
- All consumers of `TaskShift` component (props interface unchanged)
- Confirmation AlertDialog flow (unchanged, just adds time fields to summary)

## Scope

First stage — simple manual time entry with edit capability. Future iterations may add:
- Chronometer (live timer)
- Pause/resume between tasks
- Remove edit capability once users are accustomed to the button flow
