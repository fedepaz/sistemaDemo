# Simplified TaskShift Time Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify TaskShift to 2-button flow (Iniciar → Finalizar) with editable time selects revealed after Finalizar.

**Architecture:** Progressive disclosure — buttons first, editable hour/minute `<select>` dropdowns appear only after both times are captured. No Reiniciar button.

**Tech Stack:** React, react-hook-form, shadcn/ui Select, lucide-react icons

## Global Constraints
- Mobile-first responsive design (md: breakpoint)
- Spanish UI labels
- Existing Zod validation (`endTime > startTime`) — inline error, no disable
- Props interface of `TaskShift` component unchanged
- Follow existing code patterns in `taskShift.tsx`

---

### Task 1: Update taskShift.tsx — button logic and remove Reiniciar

**Files:**
- Modify: `apps/frontend/src/features/taskshift/components/taskShift.tsx`

**Changes:**
- Remove `RotateCcw` import from lucide-react
- Rename "Detener" button label to "Finalizar"
- Remove the entire Reiniciar button block (lines 128-138)
- Remove `handleReset` function (lines 62-65)

- [ ] **Step 1: Remove RotateCcw import**

Change line 12:
```tsx
import { Clock, User2, Play, Square, RotateCcw } from "lucide-react";
```
to:
```tsx
import { Clock, User2, Play, Square } from "lucide-react";
```

- [ ] **Step 2: Rename Detener to Finalizar**

Change line 124:
```tsx
            Detener
```
to:
```tsx
            Finalizar
```

- [ ] **Step 3: Remove handleReset function**

Delete lines 62-65:
```tsx
  function handleReset() {
    onStartTimeChange("");
    onEndTimeChange("");
  }
```

- [ ] **Step 4: Remove Reiniciar button block**

Delete lines 128-138:
```tsx
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
```

- [ ] **Step 5: Run type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/features/taskshift/components/taskShift.tsx
git commit -m "refactor(taskshift): rename Detener to Finalizar, remove Reiniciar"
```

---

### Task 2: Add editable time selects after Finalizar

**Files:**
- Modify: `apps/frontend/src/features/taskshift/components/taskShift.tsx`

**Interfaces:**
- Consumes: `startTime`, `endTime` props (ISO datetime strings with timezone offset)
- Produces: calls `onStartTimeChange` / `onEndTimeChange` with reconstructed ISO strings

- [ ] **Step 1: Add Select imports**

Add to existing imports:
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
```

- [ ] **Step 2: Add hour/minute option arrays**

After the `toDateTimeString` function, add:
```tsx
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
```

- [ ] **Step 3: Add helper to extract hour/minute from ISO string**

```tsx
function extractTimeParts(isoString: string): { hour: string; minute: string } {
  const localTime = utcToLocalTime(isoString);
  const [hour, minute] = localTime.split(":");
  return { hour, minute };
}
```

- [ ] **Step 4: Replace time display with editable selects**

Replace the entire "Time Display" section (lines 87-102) with:

```tsx
        {/* Time Selects (visible after Finalizar) */}
        {hasStarted && hasEnded && (
          <div className="space-y-2">
            {/* Inicio */}
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground w-12">Inicio</span>
              <div className="flex items-center gap-1">
                <Select
                  value={extractTimeParts(startTime).hour}
                  onValueChange={(val) => {
                    const { minute } = extractTimeParts(startTime);
                    onStartTimeChange(toDateTimeString(today, `${val}:${minute}`));
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs font-bold">:</span>
                <Select
                  value={extractTimeParts(startTime).minute}
                  onValueChange={(val) => {
                    const { hour } = extractTimeParts(startTime);
                    onStartTimeChange(toDateTimeString(today, `${hour}:${val}`));
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTES.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fin */}
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground w-12">Fin</span>
              <div className="flex items-center gap-1">
                <Select
                  value={extractTimeParts(endTime).hour}
                  onValueChange={(val) => {
                    const { minute } = extractTimeParts(endTime);
                    onEndTimeChange(toDateTimeString(today, `${val}:${minute}`));
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs font-bold">:</span>
                <Select
                  value={extractTimeParts(endTime).minute}
                  onValueChange={(val) => {
                    const { hour } = extractTimeParts(endTime);
                    onEndTimeChange(toDateTimeString(today, `${hour}:${val}`));
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTES.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
```

- [ ] **Step 5: Run type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/features/taskshift/components/taskShift.tsx
git commit -m "feat(taskshift): add editable hour/minute selects after Finalizar"
```

---

### Task 3: Add startTime/endTime to confirmation dialog summary

**Files:**
- Modify: `apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx:113`

**Interfaces:**
- Consumes: `fieldLabels.AsignarUbiSiembraCompleta` (already has `startTime`/`endTime` labels)

- [ ] **Step 1: Add startTime and endTime to summaryFields**

Change line 113:
```tsx
            summaryFields: ["cg", "cantidaNroCont", "prensadoSustrato", "profundidadSemilla", "tratamientoSemilla", "metodoMaquina", "detalleExtendido"],
```
to:
```tsx
            summaryFields: ["cg", "cantidaNroCont", "prensadoSustrato", "profundidadSemilla", "tratamientoSemilla", "metodoMaquina", "detalleExtendido", "startTime", "endTime"],
```

- [ ] **Step 2: Run type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: PASS (no new errors)

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx
git commit -m "feat(aSembrar): add startTime/endTime to confirmation summary"
```

---

### Task 4: Update tests

**Files:**
- Modify: `apps/frontend/src/features/aSembrar/components/__tests__/a-sembrar-data-table.test.tsx`

- [ ] **Step 1: Update summaryFields test**

Find the test "passes correct summaryFields to SlideOverForm" and add `"startTime"` and `"endTime"` to the expected array.

- [ ] **Step 2: Run tests**

Run: `pnpm --filter frontend test`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/aSembrar/components/__tests__/a-sembrar-data-table.test.tsx
git commit -m "test(aSembrar): update summaryFields test for startTime/endTime"
```
