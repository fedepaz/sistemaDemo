# TaskShift Improvements Design

**Date:** 2026-08-11
**Status:** Approved
**Author:** opencode

## Overview

Improve the TaskShift component with better time picking, employee search, atomic submit, and responsive layout. The component will be reusable across siembra, extendidos, and future features.

## Goals

1. Replace single time dropdowns with separate hour/minute selects
2. Add smart employee search (fetch all, filter locally)
3. Allow TaskShift creation without employees (just createdByUserId)
4. Atomic submit with parent form (transaction-like)
5. Tighter responsive layout on desktop
6. Use existing `getLocalDateStr` utility instead of UTC-based date

## Architecture

**Pattern:** Self-contained component with validity callback (`onValidityChange`)

- TaskShift manages all its own state internally
- Exposes `onValidityChange(isValid: boolean)` to parent
- Exposes `getData()` via `ref` for parent to retrieve form data on submit
- Parent form validates both its own fields AND TaskShift validity before enabling submit

**Reusability:** Component takes `entityId: string` as prop — entity-agnostic, can be dropped into any edit form.

## Design Sections

### Section 1: Time Picker

**Internal state:** `startHour`, `startMinute`, `endHour`, `endMinute` (strings)

**Behavior:**
- 4 `Select` dropdowns: startHour (00-23), startMinute (00-55, step 5), endHour (00-23), endMinute (00-55, step 5)
- End time selects disabled until start time is fully selected
- `endTime > startTime` validated via Zod refinement in shared schema
- `onValidityChange(false)` on mount, `true` only when both times valid

**Shared schema change** (`packages/shared/src/schemas/taskShift.schema.ts`):
```ts
CreateTaskShiftSchema = z.object({
  entityId: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  employeeUserIds: z.array(z.string().min(1)).min(0).default([]),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  { message: "La hora de fin debe ser posterior a la hora de inicio", path: ["endTime"] }
);
```

**Date utility:** Replace `new Date().toISOString().split("T")[0]` with `getLocalDateStr(new Date())` from `@/lib/date-utils`.

**Layout (compact vertical stack):**
- Mobile: Full width, stacked vertically
- `md+`: Hours/minutes for start on one row, hours/minutes for end on next row. `gap-2`.

### Section 2: Employee Search

**Layout:**
- **Search input**: Full width with search icon and "Buscar empleados" placeholder
- **Available employees**: Filterable list below search input. Each item shows name/lastname/username. Click to select → item disappears from this list.
- **Selected employees**: Separate section below with "Empleados seleccionados" label. Scrollable list. Each has a remove (X) button.

**Behavior:**
- Fetches all users from `GET /users/all` on demand (when user clicks search button or types)
- Filters locally by name, lastname, or username (case-insensitive partial match)
- No text + search → shows all available employees
- Selected employees removed from available list
- Remove from selected list → employee reappears in available list (if still matches filter)

**State:**
- `searchQuery: string`
- `allUsers: User[]` — cached from last fetch
- `selectedUserIds: string[]` — selected employee IDs
- `isSearching: boolean`
- `showResults: boolean`

### Section 3: TaskShift Without Employees + Validity Callback

**TaskShift without employees:**
- `employeeUserIds` schema: `.min(0)` (optional, defaults to `[]`)
- When empty: Backend creates only TaskShift record with `createdByUserId = current user`. No TaskShiftEmployee records.

**Validity callback:**
- `onValidityChange(isValid: boolean)` prop
- Fires on mount with `false`
- Fires whenever time selections change
- Valid when: `startHour` + `startMinute` selected AND `endHour` + `endMinute` selected AND `endTime > startTime`
- Employee selection does NOT affect time validity (employees are optional)

### Section 4: Atomic Submit + Reusability

**Atomic submit:**
- Parent form's submit button triggers both parent form data AND TaskShift creation together
- TaskShift exposes form data via `getData()` callback (via `ref`)
- Parent validates both: parent form fields + TaskShift validity
- If either is invalid, submit is disabled

**Reusability:**
- TaskShift takes `entityId: string` as prop
- No feature-specific logic inside TaskShift
- Can be dropped into any edit form that needs task shift creation

**Parent integration pattern:**
```tsx
const [isTaskShiftValid, setIsTaskShiftValid] = useState(false);
const taskShiftRef = useRef<TaskShiftHandle>(null);

async function onSubmit(values) {
  const taskShiftData = taskShiftRef.current?.getData();
  await Promise.all([
    updateEntity(values),
    taskShiftData && createTaskShift(taskShiftData),
  ]);
}

// In JSX
<TaskShift
  entityId={entity.id}
  ref={taskShiftRef}
  onValidityChange={setIsTaskShiftValid}
/>

// Submit button
<Button disabled={!isFormValid || !isTaskShiftValid}>Guardar</Button>
```

### Section 5: Parent Layout Tightening

**siembra-edit-form.tsx:**
- Reduce `gap-4 md:gap-6` → `gap-3 md:gap-4`
- Reduce `p-3 md:p-4` → `p-2 md:p-3`

**taskShift.tsx:**
- Reduce `gap-3 md:gap-4` → `gap-2 md:gap-3`
- Tighter label/input sizing on `md+`

**SlideOverForm container:** Stays at `sm:max-w-xl` (already appropriate)

## Files to Modify

| File | Changes |
|------|---------|
| `packages/shared/src/schemas/taskShift.schema.ts` | Add Zod refinement for endTime > startTime, change employeeUserIds min to 0 |
| `apps/frontend/src/features/taskshift/components/taskShift.tsx` | Refactor time selects, add employee search, add validity callback, add getData ref |
| `apps/frontend/src/features/taskshift/hooks/useTaskShift.ts` | Update mutation if needed |
| `apps/frontend/src/features/siembra/components/siembra-edit-form.tsx` | Integrate TaskShift validity, tighten layout |
| `apps/frontend/src/lib/date-utils.ts` | Already has `getLocalDateStr` — no changes needed |

## Testing

- Time picker: Verify hour/minute selects work independently
- End time disabled until start time selected
- endTime < startTime shows validation error
- Employee search: fetch all users, filter by name/lastname/username
- Selected employees disappear from available list
- Remove from selected list re-adds to available
- TaskShift without employees creates only TaskShift record
- Parent submit disabled when TaskShift invalid
- Atomic submit: both parent and TaskShift submit together
- Responsive: verify mobile and desktop layouts
