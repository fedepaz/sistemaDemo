# TaskShift Start/Stop Button Design

## Goal

Replace the manual hour/minute dropdown selection in the TaskShift component with a simple Start/Stop button pattern, making time capture instant with one click.

## Current State

The `TaskShift` component (`apps/frontend/src/features/taskshift/components/taskShift.tsx`) uses four `Select` dropdowns (start hour, start minute, end hour, end minute) for time selection. Users must manually pick hours and minutes from 24h × 12m = 288 options.

## Proposed Design

### Component States

**State 0 — Idle (no times set)**
- Single green "Iniciar" button with `Play` icon
- No time display

**State 1 — Running (startTime set, no endTime)**
- Shows captured start time: "Inicio: HH:MM" with `Clock` icon
- Red "Detener" button with `Square` icon

**State 2 — Complete (both times set)**
- Shows both times: "Inicio: HH:MM | Fin: HH:MM"
- Outline "Reiniciar" button with `RotateCcw` icon to reset to State 0

### Behavior

1. Click "Iniciar" → `onStartTimeChange(new Date().toISOString())` called immediately, transitions to State 1
2. Click "Detener" → `onEndTimeChange(new Date().toISOString())` called immediately, transitions to State 2
3. Click "Reiniciar" → both callbacks called with `""`, transitions to State 0
4. Times use the existing `toDateTimeString` helper to produce timezone-aware ISO strings
5. Employee search section remains unchanged

### Interface (unchanged)

```typescript
interface TaskShiftProps {
  startTime: string;
  endTime: string;
  employees: UserProfileDto[];
  onStartTimeChange: (startTime: string) => void;
  onEndTimeChange: (endTime: string) => void;
  onEmployeesChange: (employees: UserProfileDto[]) => void;
}
```

### Visual Design

- Button uses shadcn `Button` component
- "Iniciar": `variant="default"` (green), `Play` icon
- "Detener": `variant="destructive"` (red), `Square` icon
- "Reiniciar": `variant="outline"`, `RotateCcw` icon
- Time display: muted text with `Clock` icon, consistent with existing label styling
- Layout: vertically stacked, `gap-3 md:gap-4` spacing

## Files to Modify

| File | Change |
|------|--------|
| `apps/frontend/src/features/taskshift/components/taskShift.tsx` | Replace dropdowns with Start/Stop button, remove hour/minute state |

No other files change — the parent form (`a-sembrar-edit-form.tsx`) uses the same props/callbacks.

## Out of Scope

- Persisting start/stop times to backend (already handled by existing form submission)
- Timer/elapsed time display
- Manual time adjustment after capture
