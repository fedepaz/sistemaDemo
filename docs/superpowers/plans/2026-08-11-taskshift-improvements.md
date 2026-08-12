# TaskShift Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the TaskShift component with separate hour/minute time selects, smart employee search, atomic submit with parent form, and tighter responsive layout.

**Architecture:** Self-contained component with `onValidityChange` callback and `getData()` via ref. Shared Zod schema validation. Uses existing `getLocalDateStr` utility and `GET /users/all` endpoint for employee search.

**Tech Stack:** React, react-hook-form, Zod, shadcn/ui Select, Tailwind CSS

## Global Constraints

- Spanish-only UI strings
- Conventional Commits format enforced by commitlint
- Feature-based frontend pattern: `src/features/` with api/, hooks/, components/
- No hardcoded colors — use OKLCH theme tokens
- Mobile-first responsive design (`dvh`, `md:` breakpoints)
- No commit without explicit user approval

---

## File Structure

| File | Responsibility |
|------|----------------|
| `packages/shared/src/schemas/taskShift.schema.ts` | Zod schema with endTime > startTime refinement, employeeUserIds min(0) |
| `apps/frontend/src/features/taskshift/components/taskShift.tsx` | Refactored component: time selects, employee search, validity callback, getData ref |
| `apps/frontend/src/features/taskshift/components/employee-search.tsx` | New sub-component: search input, available/selected employee lists |
| `apps/frontend/src/features/siembra/components/siembra-edit-form.tsx` | Integrate TaskShift validity, tighten layout |

---

### Task 1: Update Shared Schema

**Files:**
- Modify: `packages/shared/src/schemas/taskShift.schema.ts`

**Interfaces:**
- Consumes: None
- Produces: Updated `CreateTaskShiftSchema` with `.refine()` for endTime > startTime, `employeeUserIds` with `.min(0)`

- [ ] **Step 1: Read current schema**

```bash
cat packages/shared/src/schemas/taskShift.schema.ts
```

- [ ] **Step 2: Update CreateTaskShiftSchema**

Replace the current `CreateTaskShiftSchema` with:

```ts
export const CreateTaskShiftSchema = z
  .object({
    entityId: z.string().min(1, "La entidad es requerida"),
    startTime: z.string().min(1, "La hora de inicio es requerida"),
    endTime: z.string().min(1, "La hora de fin es requerida"),
    employeeUserIds: z
      .array(z.string().min(1))
      .min(0)
      .default([]),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "La hora de fin debe ser posterior a la hora de inicio",
    path: ["endTime"],
  });
```

- [ ] **Step 3: Build shared package to verify**

```bash
pnpm --filter @vivero/shared build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/schemas/taskShift.schema.ts
git commit -m "fix(shared): add endTime > startTime refinement to TaskShift schema"
```

---

### Task 2: Create Employee Search Sub-Component

**Files:**
- Create: `apps/frontend/src/features/taskshift/components/employee-search.tsx`

**Interfaces:**
- Consumes: `GET /users/all` endpoint via existing service
- Produces: `EmployeeSearchProps` interface with `selectedUserIds`, `onSelect`, `onRemove` callbacks

- [ ] **Step 1: Check existing user service**

```bash
cat apps/frontend/src/features/users/api/userService.ts
```

Verify `fetchUsers` or similar function exists.

- [ ] **Step 2: Create EmployeeSearch component**

```tsx
// apps/frontend/src/features/taskshift/components/employee-search.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { userQueryKeys } from "@/lib/queryKeys";

interface User {
  id: string;
  name: string;
  lastname: string;
  username: string;
}

interface EmployeeSearchProps {
  selectedUserIds: string[];
  onSelect: (userId: string) => void;
  onRemove: (userId: string) => void;
  disabled?: boolean;
}

export function EmployeeSearch({
  selectedUserIds,
  onSelect,
  onRemove,
  disabled,
}: EmployeeSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: userQueryKeys.all,
    queryFn: async () => {
      const res = await fetch("/api/users/all");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    enabled: showResults,
  });

  const filteredUsers = allUsers.filter((user: User) => {
    const query = searchQuery.toLowerCase();
    const matchesName = user.name?.toLowerCase().includes(query);
    const matchesLastname = user.lastname?.toLowerCase().includes(query);
    const matchesUsername = user.username?.toLowerCase().includes(query);
    return (matchesName || matchesLastname || matchesUsername);
  });

  const availableUsers = filteredUsers.filter(
    (user: User) => !selectedUserIds.includes(user.id)
  );

  const selectedUsers = allUsers.filter((user: User) =>
    selectedUserIds.includes(user.id)
  );

  const handleSearch = useCallback(() => {
    setShowResults(true);
  }, []);

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
        </div>
        <Input
          placeholder="Buscar empleados..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="pl-12 md:pl-14 h-10 md:h-12 text-sm md:text-base"
          disabled={disabled}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSearch}
        disabled={disabled || isLoading}
      >
        {isLoading ? "Buscando..." : "Buscar"}
      </Button>

      {showResults && (
        <>
          {/* Available employees */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-widest opacity-70">
              Empleados disponibles
            </span>
            <ScrollArea className="h-[120px] md:h-[150px]">
              {isLoading ? (
                <div className="flex flex-col gap-1">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : availableUsers.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  No se encontraron empleados
                </p>
              ) : (
                availableUsers.map((user: User) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => onSelect(user.id)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-accent rounded-md text-left"
                    disabled={disabled}
                  >
                    <span className="font-medium">
                      {user.name} {user.lastname}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      @{user.username}
                    </span>
                  </button>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Selected employees */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-widest opacity-70">
                Empleados seleccionados
              </span>
              <ScrollArea className="h-[80px] md:h-[100px]">
                {selectedUsers.map((user: User) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between px-2 py-1.5 text-sm bg-accent/50 rounded-md"
                  >
                    <span>
                      {user.name} {user.lastname}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => onRemove(user.id)}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify imports exist**

Check that `userQueryKeys` exists in `apps/frontend/src/lib/queryKeys.ts`. If not, add it.

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/taskshift/components/employee-search.tsx
git commit -m "feat(taskshift): add employee search sub-component"
```

---

### Task 3: Refactor TaskShift Component

**Files:**
- Modify: `apps/frontend/src/features/taskshift/components/taskShift.tsx`

**Interfaces:**
- Consumes: `EmployeeSearch` from Task 2, `getLocalDateStr` from `@/lib/date-utils`
- Produces: `TaskShiftHandle` interface with `getData()` method, `onValidityChange` callback prop

- [ ] **Step 1: Read current component**

```bash
cat apps/frontend/src/features/taskshift/components/taskShift.tsx
```

- [ ] **Step 2: Rewrite TaskShift component**

```tsx
// apps/frontend/src/features/taskshift/components/taskShift.tsx
"use client";

import { forwardRef, useImperativeHandle, useEffect, useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateTaskShift } from "../hooks/useTaskShift";
import { CreateTaskShiftDto, CreateTaskShiftSchema } from "@vivero/shared";
import { usePermission } from "@/hooks/usePermission";
import { getLocalDateStr } from "@/lib/date-utils";
import { EmployeeSearch } from "./employee-search";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0")
);

export interface TaskShiftHandle {
  getData: () => CreateTaskShiftDto | null;
}

interface TaskShiftProps {
  entityId: string;
  onValidityChange?: (isValid: boolean) => void;
}

function toDateTimeString(date: string, time: string): string {
  return `${date}T${time}:00.000Z`;
}

export const TaskShift = forwardRef<TaskShiftHandle, TaskShiftProps>(
  function TaskShift({ entityId, onValidityChange }, ref) {
    const dataTablePermissions = usePermission("users");
    const { mutateAsync: createTaskShift, isPending: isCreatingTaskShift } =
      useCreateTaskShift();

    const today = getLocalDateStr(new Date());

    const [startHour, setStartHour] = useState<string>("");
    const [startMinute, setStartMinute] = useState<string>("");
    const [endHour, setEndHour] = useState<string>("");
    const [endMinute, setEndMinute] = useState<string>("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    const form = useForm<CreateTaskShiftDto>({
      resolver: zodResolver(CreateTaskShiftSchema),
      defaultValues: {
        entityId,
        startTime: "",
        endTime: "",
        employeeUserIds: [],
      },
      mode: "onChange",
    });

    const isStartComplete = startHour !== "" && startMinute !== "";
    const isEndComplete = endHour !== "" && endMinute !== "";

    const startTime = isStartComplete
      ? toDateTimeString(today, `${startHour}:${startMinute}`)
      : "";
    const endTime = isEndComplete
      ? toDateTimeString(today, `${endHour}:${endMinute}`)
      : "";

    const isTimeValid =
      isStartComplete &&
      isEndComplete &&
      new Date(endTime) > new Date(startTime);

    useEffect(() => {
      form.setValue("startTime", startTime);
      form.setValue("endTime", endTime);
      form.setValue("employeeUserIds", selectedUserIds);
      onValidityChange?.(isTimeValid);
    }, [startTime, endTime, selectedUserIds, isTimeValid, form, onValidityChange]);

    useImperativeHandle(ref, () => ({
      getData: () => {
        if (!isTimeValid) return null;
        return {
          entityId,
          startTime,
          endTime,
          employeeUserIds: selectedUserIds,
        };
      },
    }));

    const handleSelectUser = useCallback((userId: string) => {
      setSelectedUserIds((prev) => [...prev, userId]);
    }, []);

    const handleRemoveUser = useCallback((userId: string) => {
      setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
    }, []);

    if (!dataTablePermissions.canRead) {
      return null;
    }

    return (
      <div className="flex flex-col gap-2 md:gap-3 font-serif">
        {/* Title */}
        <h1 className="font-sans text-sm md:text-sm font-black uppercase tracking-widest text-foreground opacity-80">
          Tiempo de tarea
        </h1>
        <p className="font-sans text-xs md:text-sm font-medium leading-tight md:leading-relaxed opacity-70">
          Selecciona el horario de la tarea para hoy ({today}).
        </p>

        <Form {...form}>
          <div className="flex flex-col gap-2 md:gap-3">
            {/* Start Time */}
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="startTime"
                render={() => (
                  <FormItem className="space-y-1 md:space-y-2">
                    <FormLabel className="font-sans text-xs md:text-sm uppercase tracking-widest opacity-70">
                      Inicio
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-1">
                        <div className="relative flex-1">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Clock className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
                          </div>
                          <Select
                            disabled={isCreatingTaskShift}
                            value={startHour}
                            onValueChange={setStartHour}
                          >
                            <SelectTrigger className="pl-8 md:pl-10 h-9 md:h-10 text-xs md:text-sm">
                              <SelectValue placeholder="Hora" />
                            </SelectTrigger>
                            <SelectContent>
                              {HOURS.map((hour) => (
                                <SelectItem key={hour} value={hour}>
                                  {hour}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="relative flex-1">
                          <Select
                            disabled={isCreatingTaskShift}
                            value={startMinute}
                            onValueChange={setStartMinute}
                          >
                            <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                              <SelectValue placeholder="Min" />
                            </SelectTrigger>
                            <SelectContent>
                              {MINUTES.map((minute) => (
                                <SelectItem key={minute} value={minute}>
                                  {minute}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Time */}
              <FormField
                control={form.control}
                name="endTime"
                render={() => (
                  <FormItem className="space-y-1 md:space-y-2">
                    <FormLabel className="font-sans text-xs md:text-sm uppercase tracking-widest opacity-70">
                      Fin
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-1">
                        <div className="relative flex-1">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Clock className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
                          </div>
                          <Select
                            disabled={isCreatingTaskShift || !isStartComplete}
                            value={endHour}
                            onValueChange={setEndHour}
                          >
                            <SelectTrigger className="pl-8 md:pl-10 h-9 md:h-10 text-xs md:text-sm">
                              <SelectValue placeholder="Hora" />
                            </SelectTrigger>
                            <SelectContent>
                              {HOURS.map((hour) => (
                                <SelectItem key={hour} value={hour}>
                                  {hour}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="relative flex-1">
                          <Select
                            disabled={isCreatingTaskShift || !isStartComplete}
                            value={endMinute}
                            onValueChange={setEndMinute}
                          >
                            <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                              <SelectValue placeholder="Min" />
                            </SelectTrigger>
                            <SelectContent>
                              {MINUTES.map((minute) => (
                                <SelectItem key={minute} value={minute}>
                                  {minute}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Employee Search */}
            <div className="space-y-1 md:space-y-2">
              <FormLabel className="font-sans text-xs md:text-sm uppercase tracking-widest opacity-70">
                Empleados
              </FormLabel>
              <EmployeeSearch
                selectedUserIds={selectedUserIds}
                onSelect={handleSelectUser}
                onRemove={handleRemoveUser}
                disabled={isCreatingTaskShift}
              />
            </div>
          </div>
        </Form>
      </div>
    );
  }
);
```

- [ ] **Step 3: Update taskshift index.ts to export new types**

```bash
cat apps/frontend/src/features/taskshift/index.ts
```

Add `TaskShiftHandle` to exports if not already there.

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/taskshift/components/taskShift.tsx apps/frontend/src/features/taskshift/index.ts
git commit -m "feat(taskshift): refactor time selects and add employee search integration"
```

---

### Task 4: Integrate TaskShift into Siembra Edit Form

**Files:**
- Modify: `apps/frontend/src/features/siembra/components/siembra-edit-form.tsx`

**Interfaces:**
- Consumes: `TaskShift` and `TaskShiftHandle` from Task 3
- Produces: Updated form with TaskShift validity tracking and tighter layout

- [ ] **Step 1: Read current siembra-edit-form**

```bash
cat apps/frontend/src/features/siembra/components/siembra-edit-form.tsx
```

- [ ] **Step 2: Add imports and state**

Add these imports at the top:

```tsx
import { useRef, useState } from "react";
import { TaskShift, TaskShiftHandle } from "@/features/taskshift";
```

Add state inside the component:

```tsx
const [isTaskShiftValid, setIsTaskShiftValid] = useState(false);
const taskShiftRef = useRef<TaskShiftHandle>(null);
```

- [ ] **Step 3: Update TaskShift component usage**

Replace the current TaskShift usage (around line 249) with:

```tsx
<TaskShift
  entityId={selectedExtendido.partidaId.toString()}
  ref={taskShiftRef}
  onValidityChange={setIsTaskShiftValid}
/>
```

- [ ] **Step 4: Update submit button**

Find the submit button and add TaskShift validity check:

```tsx
<Button
  type="submit"
  disabled={!isFormValid || !isTaskShiftValid || isUpdating}
>
  {isUpdating ? "Guardando..." : "Guardar"}
</Button>
```

- [ ] **Step 5: Update submit handler**

In the `onSubmit` function, add TaskShift creation:

```tsx
async function onSubmit(values: UpdateExtendidoDto) {
  const taskShiftData = taskShiftRef.current?.getData();
  await Promise.all([
    updateExtendido(values),
    taskShiftData && createTaskShift(taskShiftData),
  ]);
}
```

Make sure `createTaskShift` is imported from the TaskShift hooks.

- [ ] **Step 6: Tighten layout**

Replace responsive classes:
- `gap-4 md:gap-6` → `gap-3 md:gap-4`
- `p-3 md:p-4` → `p-2 md:p-3`

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/src/features/siembra/components/siembra-edit-form.tsx
git commit -m "feat(siembra): integrate TaskShift with validity tracking and tighter layout"
```

---

### Task 5: Verify and Test

**Files:**
- None (verification only)

- [ ] **Step 1: Run lint**

```bash
pnpm lint
```

Expected: No errors.

- [ ] **Step 2: Run type check**

```bash
pnpm type-check
```

Expected: No errors.

- [ ] **Step 3: Run tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 4: Build shared package**

```bash
pnpm --filter @vivero/shared build
```

Expected: Build succeeds.

- [ ] **Step 5: Manual verification**

Start dev server and verify:
- Time selects work independently
- End time disabled until start time selected
- endTime < startTime shows validation error
- Employee search fetches and filters correctly
- Selected employees disappear from available list
- Remove from selected list re-adds to available
- Submit disabled when TaskShift invalid
- Layout is tighter on desktop

- [ ] **Step 6: Final commit if needed**

```bash
git add -A
git commit -m "fix(taskshift): verification and minor adjustments"
```
