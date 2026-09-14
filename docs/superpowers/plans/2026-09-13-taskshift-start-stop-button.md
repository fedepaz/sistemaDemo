# TaskShift Start/Stop Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the manual hour/minute dropdown selection in the TaskShift component with a simple Start/Stop button pattern.

**Architecture:** Single-file change to `taskShift.tsx` — remove Select dropdowns and hour/minute state, add a toggle button with 3 states (Idle → Running → Complete). Parent form interface unchanged.

**Tech Stack:** React, shadcn/ui Button, lucide-react icons (Play, Square, RotateCcw)

## Global Constraints

- Interface (`TaskShiftProps`) must remain identical — no parent changes
- Times captured via `new Date()` at click moment, serialized via existing `toDateTimeString` helper
- Employee search section unchanged
- Follows existing spacing patterns (`gap-3 md:gap-4`)

---

## File Structure

| Layer | File | Action |
|-------|------|--------|
| Component | `apps/frontend/src/features/taskshift/components/taskShift.tsx` | Modify (replace dropdowns with button) |

---

### Task 1: Replace dropdowns with Start/Stop button

**Files:**
- Modify: `apps/frontend/src/features/taskshift/components/taskShift.tsx`

**Interfaces:**
- Consumes: `TaskShiftProps` (unchanged), `toDateTimeString`, `utcToLocalTime`, `getLocalDateStr`
- Produces: `TaskShift` component with 3-state toggle button

- [ ] **Step 1: Remove unused imports and state**

Remove these imports (no longer needed):
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`
- `Label` from `@/components/ui/label`
- `AlertTriangle` from `lucide-react`

Remove these state variables:
- `startHour`, `startMinute`, `endHour`, `endMinute`
- `isStartComplete`, `isEndComplete`
- `validEndHours`, `validEndMinutes`
- `timeError`

Remove these functions:
- `handleStartHourChange`, `handleStartMinuteChange`
- `handleEndHourChange`, `handleEndMinuteChange`

- [ ] **Step 2: Add new imports**

Add to existing imports:
```typescript
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw } from "lucide-react";
```

- [ ] **Step 3: Add derived state**

Replace the removed state with derived state from props:

```typescript
const today = getLocalDateStr(new Date());

const hasStarted = startTime !== "";
const hasEnded = endTime !== "";

const formattedStart = hasStarted ? utcToLocalTime(startTime) : null;
const formattedEnd = hasEnded ? utcToLocalTime(endTime) : null;
```

- [ ] **Step 4: Add click handlers**

```typescript
function handleStart() {
  const now = new Date();
  const startStr = toDateTimeString(today, `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
  onStartTimeChange(startStr);
}

function handleStop() {
  const now = new Date();
  const endStr = toDateTimeString(today, `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
  onEndTimeChange(endStr);
}

function handleReset() {
  onStartTimeChange("");
  onEndTimeChange("");
}
```

- [ ] **Step 5: Replace JSX — remove dropdowns, add button**

Replace the entire time section (from `{/* Start Time */}` to the closing `</div>` before `{/* Employee Search */}`) with:

```tsx
{/* Time Control */}
<div className="space-y-3 md:space-y-4">
  <div className="flex items-center gap-2">
    <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
      <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
    </div>
    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
      Tiempo de tarea
    </h3>
    <p className="font-sans text-xs md:text-sm font-medium leading-tight md:leading-relaxed opacity-70">
      Selecciona el horario de la tarea para hoy
      <br />({today}).
    </p>
  </div>

  {/* Time Display */}
  {(hasStarted || hasEnded) && (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      {formattedStart && (
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Inicio: <span className="font-bold text-foreground">{formattedStart}</span>
        </span>
      )}
      {formattedEnd && (
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Fin: <span className="font-bold text-foreground">{formattedEnd}</span>
        </span>
      )}
    </div>
  )}

  {/* Action Button */}
  {!hasStarted && (
    <Button
      type="button"
      onClick={handleStart}
      className="w-full h-10 md:h-14 rounded-xl text-xs md:text-sm font-bold"
    >
      <Play className="h-4 w-4 mr-2" />
      Iniciar
    </Button>
  )}

  {hasStarted && !hasEnded && (
    <Button
      type="button"
      variant="destructive"
      onClick={handleStop}
      className="w-full h-10 md:h-14 rounded-xl text-xs md:text-sm font-bold"
    >
      <Square className="h-4 w-4 mr-2" />
      Detener
    </Button>
  )}

  {hasStarted && hasEnded && (
    <Button
      type="button"
      variant="outline"
      onClick={handleReset}
      className="w-full h-10 md:h-14 rounded-xl text-xs md:text-sm font-bold"
    >
      <RotateCcw className="h-4 w-4 mr-2" />
      Reiniciar
    </Button>
  )}
</div>
```

- [ ] **Step 6: Verify build**

Run: `pnpm --filter frontend build`
Expected: PASS

- [ ] **Step 7: Run lint**

Run: `pnpm lint`
Expected: 0 new errors

- [ ] **Step 8: Run tests**

Run: `pnpm --filter frontend test`
Expected: PASS (pre-existing failures OK)

---

## Summary

| What | Count |
|------|-------|
| Files modified | 1 (`taskShift.tsx`) |
| Files created | 0 |
| Lines removed | ~180 (dropdowns, state, handlers) |
| Lines added | ~60 (button, derived state, handlers) |
| Parent changes | None — same interface |
